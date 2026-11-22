'use client';

import { useId, useMemo, useRef, type KeyboardEvent } from 'react';
import Link from 'next/link';
import EditionLine from '@/components/layout/EditionLine';
import { CheckIcon } from '@/components/ui/icons';
import {
  PROVINCE_ORDER,
  UNPLACED,
  filterFeatures,
  fold,
  hasFilters,
  provinceCounts,
  specialtiesOf,
  specialtyCounts,
  type BrowseFilters,
} from '@/lib/browse';
import { provinceName } from '@/lib/format';
import { specialtyLabel } from '@/lib/specialties';
import { linkClass } from '@/lib/styles';
import type { StoreFeature } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BrowseSidebarProps {
  /** Every mapped store, as loaded once on mount. */
  features: StoreFeature[];
  /** The stores passing the current filters (what the map shows). */
  filtered: StoreFeature[];
  filters: BrowseFilters;
  onFiltersChange: (filters: BrowseFilters) => void;
  onSelectStore: (slug: string) => void;
  lastSyncedAt: string | null;
}

/** How many name matches to list under "Find" before deferring to the map. */
const MAX_MATCHES = 8;

const sectionHead = 'font-display text-prose font-semibold text-ink';
const note = 'text-meta text-ink-quiet';

/** One gazetteer line: a control, the name, dot leaders and a count. */
const rowClass = cn(
  // relative: contains the visually hidden input, so focusing it can't scroll the page.
  'group relative flex cursor-pointer items-baseline gap-2 border-l-2 border-transparent py-1 pr-2 pl-2.5 text-ui text-ink',
  'transition-colors duration-(--dur-quick) hover:bg-bg-step',
  'has-checked:border-moss has-checked:bg-bg-step has-checked:font-medium',
  'has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-moss',
  'has-disabled:cursor-default has-disabled:text-ink-faint has-disabled:hover:bg-transparent',
);

function Leader() {
  return <span aria-hidden="true" className="mb-[0.3em] min-w-4 flex-1 border-b border-dotted border-ink-faint" />;
}

function Count({ n }: { n: number }) {
  return (
    <span className="font-mono text-meta text-ink-dim tabular-nums group-has-disabled:text-ink-faint">
      {n.toLocaleString('en-CA')}
    </span>
  );
}

export default function BrowseSidebar({
  features,
  filtered,
  filters,
  onFiltersChange,
  onSelectStore,
  lastSyncedAt,
}: BrowseSidebarProps) {
  const ids = useId();
  const total = features.length;
  const active = hasFilters(filters);
  const query = filters.query.trim();

  // Facet counts: each facet counts against every *other* active filter, so
  // a number always says what choosing that row would show.
  const byProvince = useMemo(
    () => provinceCounts(filterFeatures(features, filters, 'province')),
    [features, filters],
  );
  const provinceTotal = useMemo(
    () => Object.values(byProvince).reduce((a, b) => a + b, 0),
    [byProvince],
  );
  const bySpecialty = useMemo(
    () => specialtyCounts(filterFeatures(features, filters, 'specialties')),
    [features, filters],
  );
  // Only the tags actually in use, most common first (AUDIT, Content reality).
  const tagsInUse = useMemo(() => {
    const all = specialtyCounts(features);
    return Object.keys(all).sort((a, b) => all[b] - all[a] || a.localeCompare(b));
  }, [features]);
  const tagged = useMemo(() => features.filter((f) => specialtiesOf(f.properties).length > 0).length, [features]);
  const withHours = useMemo(() => features.filter((f) => f.properties.hours_raw).length, [features]);

  // With a search that finds nothing here, how many it would find with the
  // province and specialty filters lifted: the way to widen a zero result.
  const scoped = filters.province !== null || filters.specialties.length > 0;
  const elsewhere = useMemo(() => {
    if (!query || !scoped) return 0;
    return filterFeatures(features, { query, province: null, specialties: [] }).length;
  }, [features, query, scoped]);
  const scopeWords = [
    filters.province === UNPLACED ? 'among unplaced stores' : filters.province ? `in ${provinceName(filters.province)}` : null,
    filters.specialties.length > 0
      ? `among ${filters.specialties.map((t) => specialtyLabel(t).toLowerCase()).join(' or ')} stores`
      : null,
  ]
    .filter(Boolean)
    .join(' ');

  const findRef = useRef<HTMLInputElement>(null);
  const matchList = useRef<HTMLUListElement>(null);

  const matches = useMemo(() => {
    if (!query) return [];
    const q = fold(query);
    return [...filtered].sort((a, b) => {
      const aStarts = fold(a.properties.name).startsWith(q) ? 0 : 1;
      const bStarts = fold(b.properties.name).startsWith(q) ? 0 : 1;
      return aStarts - bStarts || a.properties.name.localeCompare(b.properties.name, 'en-CA');
    });
  }, [filtered, query]);

  const set = (patch: Partial<BrowseFilters>) => onFiltersChange({ ...filters, ...patch });
  const widen = () => set({ province: null, specialties: [] });

  // Keyboard: Enter in Find opens the top match; the arrow keys move between
  // Find and the matches, as in a combobox's list.
  const matchButtons = () => Array.from(matchList.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
  const onFindKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && matches.length > 0) {
      e.preventDefault();
      onSelectStore(matches[0].properties.slug);
    } else if (e.key === 'ArrowDown' && matches.length > 0) {
      e.preventDefault();
      matchButtons()[0]?.focus();
    }
  };
  const onMatchKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const buttons = matchButtons();
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && i === 0) findRef.current?.focus();
    else buttons[Math.max(0, Math.min(buttons.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))]?.focus();
  };
  const toggleSpecialty = (tag: string, on: boolean) =>
    set({ specialties: on ? [...filters.specialties, tag] : filters.specialties.filter((t) => t !== tag) });

  const provinceRow = (value: string | null, label: string, n: number) => {
    const checked = filters.province === value;
    return (
      <li key={value ?? 'all'}>
        <label className={rowClass}>
          <input
            type="radio"
            name={`${ids}-province`}
            className="sr-only"
            checked={checked}
            disabled={n === 0 && !checked}
            onChange={() => set({ province: value })}
          />
          <span>{label}</span>
          <Leader />
          <Count n={n} />
        </label>
      </li>
    );
  };

  return (
    // The panel container (desktop column / mobile sheet) is MapPanel.
    <div className="flex flex-1 flex-col">
      {/* Display, then body, then controls. */}
      <h2 data-panel-focus tabIndex={-1} className="font-display text-title font-bold text-balance text-ink outline-offset-4">
        Every independent bookstore in Canada. Eventually.
      </h2>
      <p className="mt-3 text-body text-ink-dim">
        This is a working map, built one shop at a time. Independently owned
        only. Tap a pin for hours, specialties, and the reason to go. Found one
        that&rsquo;s missing? Tell me.
      </p>

      {/* Find: a ruled line, as on an index form */}
      <div
        className={cn(
          'mt-8 flex items-baseline gap-3 border-b border-ink-faint pb-1.5',
          'transition-colors duration-(--dur-quick) focus-within:border-moss hover:border-moss',
          'has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-moss',
        )}
      >
        <label htmlFor={`${ids}-find`} className="font-display text-prose text-ink italic">
          Find
        </label>
        <input
          id={`${ids}-find`}
          ref={findRef}
          type="search"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          onKeyDown={onFindKeyDown}
          aria-describedby={`${ids}-shown`}
          placeholder="a store or a town"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-quiet focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
        {filters.query && (
          <button
            type="button"
            onClick={() => set({ query: '' })}
            className="shrink-0 text-meta text-ink-dim transition-colors duration-(--dur-quick) hover:text-moss"
          >
            Clear<span className="sr-only"> the search</span>
          </button>
        )}
      </div>

      <p id={`${ids}-shown`} role="status" aria-live="polite" className="mt-2 min-h-[1lh] text-meta text-ink-dim">
        {active && (
          <>
            Showing{' '}
            {filtered.length === 0 ? (
              'none'
            ) : (
              <span className="font-mono text-ink tabular-nums">{filtered.length.toLocaleString('en-CA')}</span>
            )}{' '}
            of <span className="font-mono tabular-nums">{total.toLocaleString('en-CA')}</span> mapped stores
            <span aria-hidden="true"> · </span>
            <button type="button" onClick={() => onFiltersChange({ query: '', province: null, specialties: [] })} className={linkClass}>
              Clear all
            </button>
          </>
        )}
      </p>

      {query && (
        <div className="mt-2">
          {matches.length === 0 ? (
            // A zero result says where it looked and leads somewhere: wider,
            // or to the form that adds a missing store. Never a dead end.
            <div className="border-t border-line pt-2.5 text-ui text-ink-dim">
              <p>
                <span className="font-display text-ink-quiet italic">
                  No store or town {scopeWords || 'on the map'} matches &ldquo;{query}&rdquo;.
                </span>
                {elsewhere > 0 && (
                  <>
                    {' '}
                    <span className="font-mono text-ink tabular-nums">{elsewhere}</span>{' '}
                    {elsewhere === 1 ? 'does' : 'do'} elsewhere in Canada.
                  </>
                )}
              </p>
              <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {elsewhere > 0 && (
                  <button type="button" onClick={widen} className={linkClass}>
                    Search all of Canada
                  </button>
                )}
                <Link href="/submit" className={linkClass}>
                  {elsewhere > 0 ? 'Suggest a missing store' : 'Know it? Suggest a store'}
                </Link>
              </p>
            </div>
          ) : (
            <>
              <ul ref={matchList} onKeyDown={onMatchKeyDown} aria-label="Matching stores" className="border-t border-line">
                {matches.slice(0, MAX_MATCHES).map(({ properties: p }) => {
                  const place = [p.city, p.province].filter(Boolean).join(', ');
                  return (
                    <li key={p.slug} className="border-b border-line">
                      <button
                        type="button"
                        onClick={() => onSelectStore(p.slug)}
                        className="flex w-full items-baseline gap-3 px-2.5 py-1.5 text-left text-ui transition-colors duration-(--dur-quick) hover:bg-bg-step focus-visible:-outline-offset-2"
                      >
                        <span className="min-w-0 flex-1 text-ink">{p.name}</span>
                        <span className="shrink-0 font-display text-ink-quiet italic">{place || 'Unplaced'}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {matches.length > MAX_MATCHES && (
                <p className={cn(note, 'mt-1.5')}>
                  And <span className="font-mono tabular-nums">{matches.length - MAX_MATCHES}</span> more on the map.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Provinces and territories: the gazetteer index */}
      <fieldset className="mt-6">
        <legend className="mb-2 flex w-full items-baseline justify-between gap-3">
          <span className={sectionHead}>Provinces and territories</span>
          <span className="font-display text-meta text-ink-quiet italic">west to east</span>
        </legend>
        <ul>
          {provinceRow(null, 'All of Canada', provinceTotal)}
        </ul>
        <ul className="mt-1 border-t border-line pt-1">
          {PROVINCE_ORDER.map((code) => provinceRow(code, provinceName(code) ?? code, byProvince[code] ?? 0))}
        </ul>
        <ul className="mt-1 border-t border-line pt-1">
          {provinceRow(UNPLACED, 'Unplaced', byProvince[UNPLACED] ?? 0)}
        </ul>
        <p className={cn(note, 'mt-1.5 pl-3')}>
          Unplaced stores are on the map, but their province isn&rsquo;t recorded yet.
        </p>
      </fieldset>

      {/* Specialty: a short checklist of the tags in use */}
      {tagsInUse.length > 0 && (
        <fieldset className="mt-8">
          <legend className={cn(sectionHead, 'mb-2')}>Specialty</legend>
          <ul>
            {tagsInUse.map((tag) => {
              const checked = filters.specialties.includes(tag);
              const n = bySpecialty[tag] ?? 0;
              return (
                <li key={tag}>
                  <label className={cn(rowClass, 'items-center has-checked:border-transparent')}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      disabled={n === 0 && !checked}
                      onChange={(e) => toggleSpecialty(tag, e.target.checked)}
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid size-3.5 shrink-0 place-items-center border border-ink-dim bg-bg transition-colors duration-(--dur-quick)',
                        'group-hover:border-moss group-has-checked:border-moss group-has-checked:bg-moss',
                        'group-has-disabled:border-line-strong group-has-disabled:group-hover:border-line-strong',
                      )}
                    >
                      <CheckIcon className="hidden size-3 stroke-[2.25] text-bg group-has-checked:block" />
                    </span>
                    <span>{specialtyLabel(tag)}</span>
                    <Leader />
                    <Count n={n} />
                  </label>
                </li>
              );
            })}
          </ul>
          <p className={cn(note, 'mt-1.5 pl-3')}>
            <span className="font-mono tabular-nums">{tagged}</span> of{' '}
            <span className="font-mono tabular-nums">{total.toLocaleString('en-CA')}</span> mapped stores list a
            specialty so far.
          </p>
        </fieldset>
      )}

      {/* Open now: not built. Said plainly, no control, no "Coming soon". */}
      <section aria-labelledby={`${ids}-open`} className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <h3 id={`${ids}-open`} className={sectionHead}>
            Open now
          </h3>
          <span className="font-display text-ui text-ink-quiet italic">planned</span>
        </div>
        <p className={cn(note, 'mt-1')}>
          This filter needs each store&rsquo;s opening hours in the map&rsquo;s data first. Hours are listed for{' '}
          <span className="font-mono tabular-nums">{withHours}</span> mapped stores so far.
        </p>
      </section>

      <section aria-labelledby={`${ids}-hood`} className="mt-10 border-t border-ink-faint pt-4">
        <h3 id={`${ids}-hood`} className="font-display text-prose text-ink-dim italic">
          Under the hood
        </h3>
        <p className="mt-2 text-ui text-ink-dim">
          A Python pipeline pulls stores from OpenStreetMap, CIBA, and
          Wikidata, with ALQ coming for Quebec. It diffs against what&apos;s
          already stored every week, refreshes hours and phone numbers from
          Google Places monthly, and writes to Supabase Postgres with PostGIS.
          Every record carries a completeness score, and a person verifies each
          store before it appears. The map queries it live.
        </p>
        <Link href="/about" className={cn(linkClass, 'mt-3 inline-block text-ui')}>
          How this works →
        </Link>
      </section>

      <div className="mt-auto pt-10">
        <EditionLine imprint="Plate 1" count={total} countLabel="mapped" syncedAt={lastSyncedAt} />
      </div>
    </div>
  );
}
