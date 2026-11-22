"use client";

import { useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SheetState = "peek" | "half" | "full";
const ORDER: SheetState[] = ["peek", "half", "full"];

interface MapPanelProps {
  /** "index" is the browse panel; "entry" is a selected store. */
  mode: "index" | "entry";
  /** Changes whenever a different store is selected (or cleared). */
  entryKey: string | null;
  onBack: () => void;
  /** Shown at the foot of the sheet on mobile only (on desktop it's in the plate margin). */
  mobileFooter?: ReactNode;
  children: ReactNode;
}

const DESKTOP = "(min-width: 768px)";

/** Sheet heights in px, read from the same values the CSS uses. */
function sheetHeights() {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const vh = window.innerHeight;
  return { peek: 9.5 * rem, half: vh * 0.52, full: vh - 4.5 * rem };
}

/**
 * The plate's index panel. On desktop it's a column beside the map behind a
 * single neatline. Under 768px it's a bottom sheet with its own layout:
 *
 * - peek: the handle, the running head and the first lines of the panel
 * - half: about half the screen; selecting a store opens here
 * - full: almost the whole screen, leaving the title box visible
 *
 * The handle cycles through the states on tap or Enter, and can be dragged.
 * A drag snaps to the nearest state. Heights come from CSS (`data-sheet`), so
 * React only re-renders when the state changes, never during a drag.
 */
export default function MapPanel({ mode, entryKey, onBack, mobileFooter, children }: MapPanelProps) {
  const [sheet, setSheet] = useState<SheetState>("peek");
  const [prevKey, setPrevKey] = useState(entryKey);
  const asideRef = useRef<HTMLElement>(null);
  const drag = useRef<{ startY: number; startH: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const bodyId = useId();

  // A newly selected store opens the sheet at half (or keeps it full);
  // going back to the index drops it to peek.
  if (entryKey !== prevKey) {
    setPrevKey(entryKey);
    setSheet(entryKey ? (sheet === "full" ? "full" : "half") : "peek");
  }

  function cycle() {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setSheet((s) => ORDER[(ORDER.indexOf(s) + 1) % ORDER.length]);
  }

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    if (window.matchMedia(DESKTOP).matches || !asideRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest("a, button:not([data-sheet-handle])")) return;
    drag.current = {
      startY: e.clientY,
      startH: asideRef.current.getBoundingClientRect().height,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    const el = asideRef.current;
    if (!d || !el) return;
    const dy = d.startY - e.clientY;
    if (!d.moved && Math.abs(dy) < 6) return;
    d.moved = true;
    const h = sheetHeights();
    el.style.transition = "none";
    el.style.height = `${Math.min(h.full, Math.max(h.peek, d.startH + dy))}px`;
  }

  function onPointerUp(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    const el = asideRef.current;
    drag.current = null;
    if (!d || !el) return;
    el.style.transition = "";
    el.style.height = "";
    if (!d.moved) return;
    suppressClick.current = true;
    const h = sheetHeights();
    const target = d.startH + (d.startY - e.clientY);
    const nearest = ORDER.reduce((best, s) =>
      Math.abs(h[s] - target) < Math.abs(h[best] - target) ? s : best,
    );
    setSheet(nearest);
    // The click that follows a drag on the handle is swallowed by cycle();
    // a drag that started elsewhere produces no click, so clear the flag.
    window.setTimeout(() => (suppressClick.current = false), 0);
  }

  const dragHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };

  return (
    <aside
      ref={asideRef}
      aria-label={mode === "entry" ? "Store entry" : "Index to Plate 1"}
      data-sheet={sheet}
      className={cn(
        "group/sheet fixed inset-x-0 bottom-0 z-20 flex h-(--sheet-h) flex-col border-t border-ink-faint bg-bg-raised",
        "transition-[height] duration-(--dur-move) ease-(--ease-plate)",
        "md:static md:z-auto md:h-auto md:min-h-0 md:border-t-0 md:border-l md:transition-none",
      )}
    >
      {/* Sheet handle (mobile only) */}
      <button
        type="button"
        data-sheet-handle
        aria-controls={bodyId}
        aria-expanded={sheet !== "peek"}
        aria-label={sheet === "full" ? "Collapse the panel" : "Expand the panel"}
        onClick={cycle}
        {...dragHandlers}
        className="flex h-6 w-full shrink-0 cursor-grab touch-none items-start justify-center pt-2.5 focus-visible:-outline-offset-2 active:cursor-grabbing md:hidden"
      >
        <span aria-hidden="true" className="block h-[3px] w-11 bg-ink-faint" />
      </button>

      {/* Running head */}
      <div
        {...dragHandlers}
        className="flex shrink-0 touch-none items-baseline justify-between gap-3 border-b border-ink-faint px-[1.125rem] pb-2.5 md:touch-auto md:px-7 md:pt-5"
      >
        {mode === "entry" ? (
          <button
            type="button"
            onClick={onBack}
            className="text-ui text-moss underline decoration-transparent underline-offset-[3px] transition-colors duration-(--dur-quick) hover:decoration-current"
          >
            ← Back to the index
          </button>
        ) : (
          <span className="font-display text-[0.9375rem] text-ink-dim italic lining-nums">Index to Plate 1</span>
        )}
      </div>

      <div
        id={bodyId}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain max-md:group-data-[sheet=peek]/sheet:overflow-hidden"
      >
        {/* Fills the column (or sheet) so an entry's foot sits at the bottom
            instead of the panel ending in dead space. */}
        <div className="flex flex-1 flex-col px-[1.125rem] pt-4 pb-8 md:px-7 md:pt-5 md:pb-8">{children}</div>
        {mobileFooter && <div className="md:hidden">{mobileFooter}</div>}
      </div>
    </aside>
  );
}
