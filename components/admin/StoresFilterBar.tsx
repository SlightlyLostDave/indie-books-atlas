"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { CloseIcon, LoadingIcon } from "@/components/ui/icons";
import { provinceName } from "@/lib/format";
import { specialtyLabel } from "@/lib/specialties";
import { cn } from "@/lib/utils";

interface Segment {
  value: string;
  label: string;
}

/**
 * A square segmented control (the theme control's shape): every option is
 * visible, so the current filter reads at a glance without opening a menu.
 */
function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Segment[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-ui text-ink-dim">{label}</span>
      <div role="group" aria-label={label} className="inline-flex border border-line-strong">
        {options.map((option, i) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-(--control-h-sm) px-2.5 text-ui text-ink-dim transition-colors duration-(--dur-quick) hover:text-ink focus-visible:-outline-offset-2",
              "aria-pressed:bg-ink aria-pressed:font-medium aria-pressed:text-bg",
              i > 0 && "border-l border-line-strong",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** One active filter, removable. Square, hairline: a slip, not a pill. */
function ActiveFilter({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li className="inline-flex h-6 items-center border border-ink-faint bg-bg-raised text-ui text-ink">
      <span className="pr-1 pl-2">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-full items-center px-1.5 text-ink-dim transition-colors duration-(--dur-quick) hover:bg-bg-step hover:text-ink focus-visible:-outline-offset-2"
      >
        <CloseIcon className="size-3" />
        <span className="sr-only">Remove filter: {label}</span>
      </button>
    </li>
  );
}

/** The search box is uncontrolled (it pushes the URL as you type), so clearing a filter empties it directly. */
function clearSearchBox() {
  const input = document.getElementById("stores-search");
  if (input instanceof HTMLInputElement) input.value = "";
}

export function StoresFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  }

  function clearAll() {
    clearSearchBox();
    startTransition(() => {
      router.push(pathname);
    });
  }

  const search = searchParams.get("search") ?? "";
  const verified = searchParams.get("verified") ?? "";
  const needsReview = searchParams.get("needsReview") === "true";
  const maxQuality = searchParams.get("maxQualityScore");
  const province = searchParams.get("province");
  const specialty = searchParams.get("specialty");

  const active: { key: string; label: string; clear: () => void }[] = [];
  if (search) {
    active.push({
      key: "search",
      label: `Name or city contains “${search}”`,
      clear: () => {
        clearSearchBox();
        setParam("search", "");
      },
    });
  }
  if (verified === "verified" || verified === "unverified") {
    active.push({ key: "verified", label: verified === "verified" ? "Verified" : "Unverified", clear: () => setParam("verified", "") });
  }
  if (needsReview) {
    active.push({ key: "needsReview", label: "Needs review", clear: () => setParam("needsReview", "") });
  }
  if (maxQuality) {
    const n = Number(maxQuality);
    active.push({
      key: "maxQualityScore",
      label: Number.isFinite(n) && n % 10 === 9 ? `Completeness below ${n + 1}` : `Completeness ${maxQuality} or less`,
      clear: () => setParam("maxQualityScore", ""),
    });
  }
  if (province) {
    active.push({ key: "province", label: `Province: ${provinceName(province)}`, clear: () => setParam("province", "") });
  }
  if (specialty) {
    active.push({ key: "specialty", label: `Specialty: ${specialtyLabel(specialty)}`, clear: () => setParam("specialty", "") });
  }

  return (
    <div className="flex flex-col gap-(--gap-stack)">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="w-full sm:w-72">
          <label htmlFor="stores-search" className="sr-only">
            Search by name or city
          </label>
          <Input
            id="stores-search"
            type="search"
            placeholder="Search by name or city"
            defaultValue={search}
            onChange={(e) => setParam("search", e.target.value)}
            onKeyDown={(e) => {
              // Esc clears the search; on an empty box it hands the keys back to the rows.
              if (e.key !== "Escape") return;
              if (e.currentTarget.value) {
                e.preventDefault();
                e.currentTarget.value = "";
                setParam("search", "");
              } else {
                e.currentTarget.blur();
              }
            }}
          />
        </div>
        <Segmented
          label="Verification"
          value={verified === "verified" || verified === "unverified" ? verified : "all"}
          onChange={(v) => setParam("verified", v === "all" ? "" : v)}
          options={[
            { value: "all", label: "All" },
            { value: "verified", label: "Verified" },
            { value: "unverified", label: "Unverified" },
          ]}
        />
        <Segmented
          label="Review"
          value={needsReview ? "true" : "all"}
          onChange={(v) => setParam("needsReview", v === "true" ? "true" : "")}
          options={[
            { value: "all", label: "All" },
            { value: "true", label: "Needs review" },
          ]}
        />
        {isPending && (
          <span role="status" className="inline-flex items-center gap-1.5 text-ui text-ink-dim">
            <LoadingIcon className="size-4 text-moss" />
            <span className="font-display italic">Updating…</span>
          </span>
        )}
      </div>

      <div className="flex min-h-6 flex-wrap items-center gap-x-3 gap-y-2 text-ui">
        <span className="text-ink-dim">{active.length > 0 ? "Showing" : "Showing every store"}</span>
        {active.length > 0 && (
          <>
            <ul aria-label="Active filters" className="flex flex-wrap gap-1.5">
              {active.map((filter) => (
                <ActiveFilter key={filter.key} label={filter.label} onRemove={filter.clear} />
              ))}
            </ul>
            {active.length > 1 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-moss underline decoration-line-strong underline-offset-[3px] hover:decoration-current"
              >
                Clear all
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
