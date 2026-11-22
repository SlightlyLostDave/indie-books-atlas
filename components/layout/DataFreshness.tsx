import { formatSyncDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DataFreshnessProps {
  /** Last successful sync, or `null` if it couldn't be loaded. */
  syncedAt: Date | string | null;
  className?: string;
}

/**
 * "Store data last synced: <date>". A visible signal that the atlas is
 * actively maintained. Plain (non-async) so client trees can render it too.
 */
export default function DataFreshness({ syncedAt, className }: DataFreshnessProps) {
  const iso = syncedAt ? new Date(syncedAt).toISOString() : null;

  return (
    <p
      className={cn(
        "flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink-dim",
        className,
      )}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
      {iso ? (
        <span>
          Store data last synced: <time dateTime={iso}>{formatSyncDate(iso)}</time>
        </span>
      ) : (
        <span>Store data synced weekly from OpenStreetMap</span>
      )}
    </p>
  );
}
