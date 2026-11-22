import type { ReactNode } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

/**
 * A section of the compilation office that isn't built yet, said plainly
 * (DESIGN.md, Do and don't: "say planned in italic with what it's waiting
 * on"). Three ruled entries: what it will do, what it's waiting on, and
 * what to do in the meantime. The dashed frame marks a place that isn't on
 * the plate yet (DESIGN.md, Shape).
 */
export function PlannedSection({
  title,
  lede,
  willDo,
  waitingOn,
  meanwhile,
  placeholder,
  children,
}: {
  title: string;
  lede: string;
  willDo: ReactNode;
  waitingOn: ReactNode;
  meanwhile: ReactNode;
  /** One line for the dashed frame where the section's work will sit. */
  placeholder: string;
  children?: ReactNode;
}) {
  const rows: [string, ReactNode][] = [
    ["What it will do", willDo],
    ["Waiting on", waitingOn],
    ["Until then", meanwhile],
  ];

  return (
    <div className="max-w-4xl">
      <AdminPageHeader title={title} marker="planned" lede={lede} />

      <dl className="mt-(--gap-block)">
        {rows.map(([label, body]) => (
          <div
            key={label}
            className="grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6"
          >
            <dt className="font-display text-prose text-ink-dim italic">{label}</dt>
            <dd className="flex max-w-[38rem] flex-col gap-2 text-body text-ink">{body}</dd>
          </div>
        ))}
      </dl>

      {children}

      <div className="mt-(--gap-section) grid min-h-40 place-items-center border border-dashed border-ink-faint p-6 text-center">
        <p className="font-display text-prose text-ink-quiet italic">{placeholder}</p>
      </div>
    </div>
  );
}
