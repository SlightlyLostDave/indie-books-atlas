import type { ReactNode } from "react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { CreditLinks, Imprint } from "@/components/layout/Footer";

interface PlateProps {
  /** The map itself. It fills the inner neatline. */
  map: ReactNode;
  /** The index panel: a right column on desktop, a bottom sheet on mobile. */
  panel: ReactNode;
  storeCount: number;
}

/**
 * The home page as an atlas plate (docs/design/DESIGN.md, Layout frames).
 * The map fills a double neatline. The title block, theme control and credits
 * live inside the frame and its margins rather than in a header and footer.
 *
 * Under 768px the plate is a single thin neatline that stops above the
 * sheet's peek height, so the map's attribution stays visible.
 */
export default function Plate({ map, panel, storeCount }: PlateProps) {
  const count = storeCount.toLocaleString("en-CA");

  return (
    <div className="relative h-dvh overflow-hidden bg-bg md:grid md:grid-cols-[minmax(0,1fr)_var(--panel-w)]">
      <section
        aria-labelledby="plate-title"
        className="absolute inset-x-0 top-0 bottom-(--sheet-peek) md:relative md:inset-auto md:min-h-0"
      >
        {/* Outer neatline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-(--plate-inset) z-10 border border-line-strong"
        />

        {/* Inner neatline: the map's window */}
        <div className="absolute top-(--plate-o) right-(--plate-o) bottom-(--plate-o-foot) left-(--plate-o) md:border md:border-ink-faint">
          {map}
        </div>

        {/* Title block */}
        <div className="absolute top-[calc(var(--plate-o)+0.5rem)] left-[calc(var(--plate-o)+0.5rem)] z-10 border border-ink-faint bg-bg-raised px-2.5 pt-2 pb-1.5 md:top-[calc(var(--plate-o)+0.875rem)] md:left-[calc(var(--plate-o)+0.875rem)] md:w-[18.5rem] md:px-4 md:pt-3.5 md:pb-3">
          <h1
            id="plate-title"
            className="font-display text-[1.0625rem] leading-none font-bold text-ink md:text-title"
          >
            Indie Books Atlas
          </h1>
          <p className="mt-1.5 hidden font-display text-[0.9375rem] leading-snug text-ink-dim italic md:block">
            A field guide to Canada&apos;s independent bookstores
          </p>
          <div aria-hidden="true" className="mt-3 mb-2 hidden border-t-2 border-ink md:block" />
          <p className="mt-1 font-mono text-label text-ink-dim md:mt-0 md:text-meta">
            Plate 1 · {count} stores mapped
          </p>
        </div>

        {/* Plate controls */}
        <div className="absolute top-[calc(var(--plate-o)+0.5rem)] right-[calc(var(--plate-o)+0.5rem)] z-10 md:top-[calc(var(--plate-o)+0.75rem)] md:right-[calc(var(--plate-o)+0.75rem)]">
          <ThemeToggle />
        </div>

        {/* Credits in the foot margin, under the inner neatline */}
        <div className="absolute right-(--plate-o) bottom-(--plate-inset) left-(--plate-o) hidden h-(--plate-foot) items-center justify-between gap-6 text-meta md:flex">
          <Imprint />
          <CreditLinks />
        </div>
      </section>

      {panel}
    </div>
  );
}
