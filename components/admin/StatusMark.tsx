import { CheckIcon, CloseIcon, DotMark, FlagMark } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type StoreStatus = "verified" | "unverified" | "review" | "closed" | "deleted";

/*
 * Status as glyph plus word, never colour alone (DESIGN.md, Iconography):
 * ✓ Verified, · Unverified, ■ Review, × Closed. The review flag is the
 * admin's one use of amber (principle 4). Deleted reuses the × in ink-dim,
 * since it's an admin state the public never sees.
 */
const MARKS: Record<StoreStatus, { label: string; short: string; Glyph: typeof CheckIcon; tone: string }> = {
  verified: { label: "Verified", short: "Verified", Glyph: CheckIcon, tone: "text-moss" },
  unverified: { label: "Unverified", short: "Unverified", Glyph: DotMark, tone: "text-ink-faint" },
  review: { label: "Needs review", short: "Review", Glyph: FlagMark, tone: "text-amber" },
  closed: { label: "Permanently closed", short: "Closed", Glyph: CloseIcon, tone: "text-danger" },
  deleted: { label: "Deleted", short: "Deleted", Glyph: CloseIcon, tone: "text-ink-dim" },
};

export function StatusMark({
  status,
  short = false,
  className,
}: {
  status: StoreStatus;
  /** "Review" and "Closed" instead of the full words, for table cells. */
  short?: boolean;
  className?: string;
}) {
  const { label, short: shortLabel, Glyph, tone } = MARKS[status];
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap text-ink-dim", className)}>
      <Glyph className={cn("size-3.5", tone)} strokeWidth={status === "verified" ? 2 : 1.75} />
      <span className={cn(status !== "unverified" && "text-ink")}>{short ? shortLabel : label}</span>
    </span>
  );
}

/** Every status that applies to a store, in reading order. */
export function storeStatuses(store: {
  is_verified: boolean;
  needs_review: boolean;
  is_permanently_closed: boolean;
  is_deleted?: boolean;
}): StoreStatus[] {
  const out: StoreStatus[] = [store.is_verified ? "verified" : "unverified"];
  if (store.needs_review) out.push("review");
  if (store.is_permanently_closed) out.push("closed");
  if (store.is_deleted) out.push("deleted");
  return out;
}
