"use client";

import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDownIcon, ChevronUpIcon, SortableIcon } from "@/components/ui/icons";
import { Completeness, Unknown } from "@/components/store/EntryParts";
import { StatusMark, storeStatuses } from "@/components/admin/StatusMark";
import { figure, sourceLabel } from "@/components/admin/labels";
import { linkClass } from "@/lib/styles";
import type { AdminStoreRow } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/** Names that appear more than once in the current list, so lookalike rows show their slug. */
const DuplicateNames = createContext<Set<string>>(new Set());

function placeOf(store: AdminStoreRow): string {
  return [store.city, store.province].filter(Boolean).join(", ");
}

function NameCell({ store }: { store: AdminStoreRow }) {
  const duplicates = useContext(DuplicateNames);
  const place = placeOf(store);
  return (
    <div className="min-w-0">
      <Link
        href={`/admin/stores/${store.slug}`}
        data-row-link
        className="font-medium text-ink no-underline decoration-line-strong underline-offset-[3px] transition-colors duration-(--dur-quick) hover:text-moss hover:underline"
      >
        {store.name}
      </Link>
      {duplicates.has(store.name) && (
        <span className="block font-mono text-meta break-all text-ink-faint">{store.slug}</span>
      )}
      <span className="block text-meta text-ink-dim md:hidden">
        {place || <Unknown>Place not recorded</Unknown>}
      </span>
    </div>
  );
}

const columns: ColumnDef<AdminStoreRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <NameCell store={row.original} />,
  },
  {
    accessorKey: "city",
    header: "Place",
    cell: ({ row }) => {
      const place = placeOf(row.original);
      return place ? <span className="text-ink-dim">{place}</span> : <Unknown>Not recorded</Unknown>;
    },
  },
  {
    accessorKey: "data_quality_score",
    header: "Completeness",
    cell: ({ row }) => (
      <Completeness
        as="span"
        label={null}
        score={row.original.data_quality_score}
        className="gap-2"
        segmentClassName="w-1.5 sm:w-2"
      />
    ),
  },
  {
    accessorKey: "is_verified",
    header: "Status",
    cell: ({ row }) => (
      <span className="flex flex-col items-start gap-0.5 lg:flex-row lg:gap-3">
        {storeStatuses(row.original).map((status) => (
          <StatusMark key={status} status={status} short />
        ))}
      </span>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => <span className="text-ink-dim">{sourceLabel(row.original.source)}</span>,
  },
];

/** Columns folded into the name cell under 768px, so the table fits a phone without sideways scrolling. */
const WIDE_ONLY = new Set(["city", "source"]);

const SORT_WORDS: Record<string, [asc: string, desc: string]> = {
  name: ["name, A to Z", "name, Z to A"],
  city: ["city, A to Z", "city, Z to A"],
  data_quality_score: ["completeness, lowest first", "completeness, highest first"],
  is_verified: ["status, unverified first", "status, verified first"],
  source: ["source, A to Z", "source, Z to A"],
};

/** Typing in a field (or a menu that takes keys) owns the keyboard. */
function isTyping(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.getAttribute("role") === "combobox";
}

/**
 * Keyboard row navigation. Moves real focus between the rows' name links,
 * so Enter opens a store natively and screen readers announce the row.
 * j / k always move; the arrow keys move only once a row has focus, so
 * they keep scrolling the page otherwise. / jumps to the search box and Esc
 * leaves the rows. Off while typing, with a modifier held, or with a dialog
 * open. Rows are read from the DOM, so the order follows the current sort.
 */
function useRowKeys(body: React.RefObject<HTMLTableSectionElement | null>) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(document.activeElement)) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;

      if (e.key === "/") {
        const search = document.getElementById("stores-search");
        if (search instanceof HTMLInputElement) {
          e.preventDefault();
          search.focus();
          search.select();
        }
        return;
      }

      const links = Array.from(body.current?.querySelectorAll<HTMLAnchorElement>("a[data-row-link]") ?? []);
      if (links.length === 0) return;
      const current = links.indexOf(document.activeElement as HTMLAnchorElement);
      const onRow = current >= 0;

      let next: number;
      if (e.key === "j" || (onRow && e.key === "ArrowDown")) {
        next = onRow ? Math.min(current + 1, links.length - 1) : 0;
      } else if (e.key === "k" || (onRow && e.key === "ArrowUp")) {
        next = onRow ? Math.max(current - 1, 0) : 0;
      } else if (onRow && e.key === "Escape") {
        links[current].blur();
        return;
      } else {
        return;
      }

      e.preventDefault();
      links[next].focus({ preventScroll: true });
      links[next].closest("tr")?.scrollIntoView({ block: "nearest" });
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [body]);
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-4 items-center justify-center border border-line-strong px-1 font-mono text-label text-ink-dim">
      {children}
    </kbd>
  );
}

export function StoresTable({ data }: { data: AdminStoreRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  useRowKeys(bodyRef);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const duplicates = useMemo(() => {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const store of data) {
      if (seen.has(store.name)) dupes.add(store.name);
      seen.add(store.name);
    }
    return dupes;
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="border-t border-ink-faint pt-4">
        <p className="font-display text-prose text-ink-dim italic">No stores match these filters.</p>
        <p className="mt-2 text-ui">
          <Link href="/admin/stores" className={linkClass}>
            Clear all filters
          </Link>
        </p>
      </div>
    );
  }

  const current = sorting[0];
  const sortWords = current ? SORT_WORDS[current.id]?.[current.desc ? 1 : 0] : null;

  return (
    <DuplicateNames.Provider value={duplicates}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p aria-live="polite" className="text-ui text-ink-dim">
          <span className="font-mono text-ink tabular-nums">{figure(data.length)}</span>{" "}
          {data.length === 1 ? "store" : "stores"} · {sortWords ? `Sorted by ${sortWords}` : "In name order"}
        </p>
        <p className="hidden items-center gap-1.5 text-meta text-ink-faint md:flex">
          <Key>j</Key>
          <Key>k</Key>
          <span>move</span>
          <span aria-hidden="true">·</span>
          <Key>Enter</Key>
          <span>opens</span>
          <span aria-hidden="true">·</span>
          <Key>/</Key>
          <span>search</span>
        </p>
      </div>
      <Table containerClassName="overflow-x-visible" className="border-separate border-spacing-0">
        <TableHeader className="[&_tr]:border-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-0 hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const canSort = header.column.getCanSort();
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : canSort ? "none" : undefined}
                    className={cn(
                      "sticky top-(--admin-sticky-top) z-10 border-b-2 border-ink bg-bg px-0 pt-3 pb-1",
                      header.column.id === "name" && "border-l-2 border-l-transparent",
                      WIDE_ONLY.has(header.column.id) && "hidden md:table-cell",
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "inline-flex items-center gap-1 px-3 py-1 text-meta transition-colors duration-(--dur-quick) hover:text-ink focus-visible:-outline-offset-2",
                          sorted ? "font-medium text-ink" : "font-medium text-ink-dim",
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === "asc" ? (
                          <ChevronUpIcon className="size-3.5 text-moss" strokeWidth={2} />
                        ) : sorted === "desc" ? (
                          <ChevronDownIcon className="size-3.5 text-moss" strokeWidth={2} />
                        ) : (
                          <SortableIcon className="size-3.5 text-ink-faint" />
                        )}
                      </button>
                    ) : (
                      <span className="px-3">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody ref={bodyRef}>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="group/row border-0 scroll-mt-[calc(var(--admin-sticky-top)+2.75rem)] has-[a[data-row-link]:focus-visible]:bg-bg-step"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "border-b border-line align-top",
                    // The current-row rule (DESIGN.md, Focus and states): moss on the leading edge.
                    cell.column.id === "name" &&
                      "w-[40%] border-l-2 border-l-transparent whitespace-normal group-has-[a[data-row-link]:focus-visible]/row:border-l-moss",
                    WIDE_ONLY.has(cell.column.id) && "hidden md:table-cell",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DuplicateNames.Provider>
  );
}
