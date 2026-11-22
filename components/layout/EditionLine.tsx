import DataFreshness from "@/components/layout/DataFreshness";
import { cn } from "@/lib/utils";

interface EditionLineProps {
  /** e.g. "Plate 1" or "Notes on the compilation". */
  imprint: string;
  count: number;
  /** "mapped" (stores with a point) or "recorded" (every public entry). */
  countLabel: "mapped" | "recorded";
  syncedAt: Date | string | null;
  className?: string;
}

/**
 * The atlas's edition line, as printed under an imprint: the imprint in
 * tracked capitals (the system's one use of them), then the count and the
 * last sync as one sentence of figures, between the plate rule and a hairline.
 */
export default function EditionLine({ imprint, count, countLabel, syncedAt, className }: EditionLineProps) {
  return (
    <div className={cn("border-t-2 border-b border-t-ink border-b-line py-2.5", className)}>
      <p className="text-label font-medium tracking-[0.2em] text-ink-dim uppercase">
        Indie Books Atlas · {imprint}
      </p>
      <p className="mt-1.5 text-meta text-ink-dim">
        <span className="font-mono text-ink tabular-nums">{count.toLocaleString("en-CA")}</span>{" "}
        {count === 1 ? "store" : "stores"} {countLabel} · <DataFreshness syncedAt={syncedAt} inline />
      </p>
    </div>
  );
}
