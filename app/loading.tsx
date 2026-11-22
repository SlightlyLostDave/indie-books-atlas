import Plate from "@/components/layout/Plate";
import { LoadingIcon } from "@/components/ui/icons";

/**
 * The atlas while the plate's data is read (the home page queries the
 * stores on every request). Not a centred spinner: the plate itself, drawn
 * in place with its frame, title block and index column, so when the map
 * arrives nothing moves. The legend line and the index say what's
 * happening; the only motion is the loading trace.
 *
 * The panel mirrors MapPanel's frame (desktop column, mobile sheet at peek)
 * without its controls, since nothing in it works yet.
 */
export default function Loading() {
  return (
    <Plate
      storeCount={0}
      pending
      map={<div className="h-full w-full bg-bg-step" />}
      panel={
        <aside
          aria-label="Index to Plate 1"
          className="fixed inset-x-0 bottom-0 z-20 flex h-(--sheet-peek) flex-col border-t border-ink-faint bg-bg-raised md:static md:h-auto md:border-t-0 md:border-l"
        >
          <div aria-hidden="true" className="flex h-6 shrink-0 items-start justify-center pt-2.5 md:hidden">
            <span className="block h-[3px] w-11 bg-ink-faint" />
          </div>
          <div className="flex shrink-0 items-baseline border-b border-ink-faint px-[1.125rem] pb-2.5 md:px-7 md:pt-5">
            <span className="font-display text-[0.9375rem] text-ink-dim italic">Index to Plate 1</span>
          </div>
          <div className="px-[1.125rem] pt-4 md:px-7 md:pt-5">
            <p role="status" className="flex items-center gap-2 text-ui text-ink-dim">
              <LoadingIcon className="size-4 text-moss" />
              <span className="font-display italic">Reading the index of stores…</span>
            </p>
          </div>
        </aside>
      }
    />
  );
}
