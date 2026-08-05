import type { StoreFeatureCollection } from '@/lib/types';

const PROVINCES = [
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
];

const SPECIALTIES = [
  'Used',
  'Rare & antiquarian',
  "Children's",
  'Francophone',
  'Indigenous',
  'LGBTQ+',
  'Genre fiction',
  'Academic',
  'Art & design',
  'Multilingual',
];

interface BrowseSidebarProps {
  initialData: StoreFeatureCollection;
}

export default function BrowseSidebar({ initialData }: BrowseSidebarProps) {
  const storeCount = initialData.features.length;

  return (
    <aside className="hidden md:block md:w-[380px] md:flex-shrink-0 md:overflow-y-auto md:border-l md:border-line md:bg-bg-raised md:p-6">
      <h2 className="font-display text-xl font-semibold text-ink">
        Every independent bookstore in Canada. Eventually.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-dim">
        This is a working map, built one shop at a time. Independently owned
        only. Tap a pin for hours, specialties, and the reason to go. Found one
        that's missing? Tell me.
      </p>

      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-amber">
        {storeCount} {storeCount === 1 ? 'store' : 'stores'} mapped
      </p>

      <div className="relative mt-6 border-t border-line pt-6">
        <div className="pointer-events-none select-none opacity-30">
          <input
            type="text"
            disabled
            placeholder="Search by name or city"
            className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink-dim placeholder:text-ink-faint disabled:cursor-not-allowed"
          />

          <h3 className="mt-6 font-mono text-xs uppercase tracking-widest text-ink-dim">
            Filters
          </h3>

          <div className="mt-4 flex items-center justify-between gap-4">
            <label
              htmlFor="province-filter"
              className="font-mono text-xs uppercase tracking-widest text-ink-faint"
            >
              Province
            </label>
            <select
              id="province-filter"
              disabled
              defaultValue=""
              className="rounded-md border border-line bg-bg px-2 py-1 text-sm text-ink-dim disabled:cursor-not-allowed"
            >
              <option value="">All</option>
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-ink-faint">
              Open now
            </span>
            <button
              type="button"
              disabled
              aria-label="Open now filter (coming soon)"
              className="relative h-5 w-9 cursor-not-allowed rounded-full border border-line bg-bg"
            >
              <span className="absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-ink-faint" />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {SPECIALTIES.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-moss-deep/40 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-moss"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 top-6 flex items-center justify-center">
          <span className="rounded-full border border-line bg-bg-raised px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-ink-faint shadow-sm">
            Coming soon
          </span>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-6">
        <h3 className="font-mono text-xs uppercase tracking-widest text-ink-dim">
          Under the hood
        </h3>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          A Python pipeline pulls from OpenStreetMap, diffs against what&apos;s
          already stored, enriches from store websites, and writes to Supabase
          Postgres with PostGIS. Every record carries a completeness score.
          The map queries it live.
        </p>
      </div>
    </aside>
  );
}
