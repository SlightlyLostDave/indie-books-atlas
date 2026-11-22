import type { ReactNode } from "react";
import { specialtyLabel } from "@/lib/specialties";
import { linkClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

/** An unknown value: Playfair italic in ink-faint (DESIGN.md, principle 5). */
export function Unknown({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-display text-ink-faint italic", className)}>{children}</span>;
}

/** "a, b and c" */
export function joinList(items: string[], last = "and"): string {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${last} ${items[items.length - 1]}`;
}

/** Specialties as a moss square bullet and words, never pills. */
export function SpecialtyLine({ tags, className }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null;
  return (
    <p className={cn("flex items-baseline gap-2 text-ink-dim", className)}>
      <span aria-hidden="true" className="inline-block size-2 shrink-0 -translate-y-px bg-moss" />
      <span>
        {tags.length === 1 ? "Specialty" : "Specialties"}:{" "}
        <span className="font-medium text-ink">{tags.map(specialtyLabel).join(", ")}</span>
      </span>
    </p>
  );
}

const SEGMENTS = 10;

/**
 * `data_quality_score` as a segmented scale, like the bar under a plate
 * title: one segment per 10 points. It moves in steps (phone, website, hours
 * and verification are 20 each; description and Instagram 10), so it's drawn
 * as discrete steps rather than a gauge. Filled versus hollow carries the
 * reading, not the colour.
 */
export function Completeness({
  score,
  className,
  label = "Completeness",
  as: Tag = "p",
  segmentClassName = "w-2.5",
}: {
  score: number;
  className?: string;
  /** The word before the scale. `null` drops it, as in a table column headed "Completeness". */
  label?: string | null;
  as?: "p" | "span";
  /** Segment width. The admin table narrows it on small screens. */
  segmentClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const filled = Math.round(clamped / (100 / SEGMENTS));

  return (
    <Tag className={cn("flex items-center gap-3 text-ui text-ink-dim", className)}>
      {label && <span>{label}</span>}
      <span aria-hidden="true" className="inline-flex border border-ink-faint">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5",
              segmentClassName,
              i > 0 && "border-l border-ink-faint",
              i < filled ? "bg-moss" : "bg-transparent",
            )}
          />
        ))}
      </span>
      <span className="font-mono text-ink tabular-nums lining-nums">
        {clamped}
        <span className="sr-only"> out of 100</span>
      </span>
    </Tag>
  );
}

/** An Instagram handle or URL as "@handle ↗". */
export function InstagramLink({ handle }: { handle: string }) {
  const isUrl = /^https?:\/\//i.test(handle);
  const name = isUrl ? handle.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "") : handle.replace(/^@/, "");
  const href = isUrl ? handle : `https://www.instagram.com/${encodeURIComponent(name)}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      @{name} ↗
    </a>
  );
}
