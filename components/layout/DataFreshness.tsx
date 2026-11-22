import { formatSyncDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DataFreshnessProps {
  /** Last successful sync, or `null` if it couldn't be loaded. */
  syncedAt: Date | string | null;
  className?: string;
  /** Render as a `span`, for use inside an edition line. */
  inline?: boolean;
}

/**
 * "Store data last synced: <date>". A plain sentence with the date set as a
 * figure (DESIGN.md: no status dot, no tracked caps). Plain (non-async) so
 * client trees can render it too.
 */
export default function DataFreshness({ syncedAt, className, inline = false }: DataFreshnessProps) {
  const iso = syncedAt ? new Date(syncedAt).toISOString() : null;
  const Tag = inline ? "span" : "p";

  return (
    <Tag className={cn("text-ink-dim", className)}>
      {iso ? (
        <>
          Store data last synced:{" "}
          <time dateTime={iso} className="font-mono text-ink tabular-nums">
            {formatSyncDate(iso)}
          </time>
        </>
      ) : (
        "Store data synced weekly from OpenStreetMap"
      )}
    </Tag>
  );
}
