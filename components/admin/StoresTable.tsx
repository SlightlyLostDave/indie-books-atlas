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
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AdminStoreRow } from "@/lib/admin/types";

const columns: ColumnDef<AdminStoreRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/admin/stores/${row.original.slug}`}
        className="font-medium text-ink hover:text-moss"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => (
      <span className="text-ink-dim">
        {[row.original.city, row.original.province].filter(Boolean).join(", ") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "data_quality_score",
    header: "Quality",
    cell: ({ row }) => {
      const score = row.original.data_quality_score;
      return (
        <span className={score < 40 ? "text-danger" : "text-ink-dim"}>
          {score}
        </span>
      );
    },
  },
  {
    accessorKey: "is_verified",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1.5">
        {row.original.is_verified && (
          <Badge className="bg-moss/15 text-moss">Verified</Badge>
        )}
        {row.original.needs_review && (
          <Badge className="bg-amber/15 text-amber">Needs review</Badge>
        )}
        {row.original.is_permanently_closed && (
          <Badge className="bg-danger/15 text-danger">Closed</Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-ink-faint">
        {row.original.source}
      </span>
    ),
  },
];

export function StoresTable({ data }: { data: AdminStoreRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-line bg-bg-raised p-6 text-ink-dim">
        No stores match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="cursor-pointer select-none font-mono text-xs uppercase tracking-widest text-ink-dim"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
