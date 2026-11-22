"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StoreMap from "@/components/map/StoreMap";
import BrowseSidebar from "@/components/map/BrowseSidebar";
import StoresUnavailable from "@/components/map/StoresUnavailable";
import StoreSidebar from "@/components/store/StoreSidebar";
import Plate from "@/components/layout/Plate";
import MapPanel from "@/components/layout/MapPanel";
import { CreditLinks, Imprint } from "@/components/layout/Footer";
import { NO_FILTERS, UNPLACED, filterFeatures, hasFilters, regionBounds, type BrowseFilters } from "@/lib/browse";
import type { StoreFeature, StoreFeatureCollection } from "@/lib/types";

interface MapExplorerProps {
  /** `null` when the stores query failed (lib/stores.ts). */
  initialData: StoreFeatureCollection | null;
  /** ISO timestamp of the last successful data sync, if known. */
  lastSyncedAt: string | null;
}

/** A selection, and whether the map should move to it (it shouldn't for a map click). */
interface Selection {
  slug: string;
  focus: boolean;
}

export default function MapExplorer({ initialData, lastSyncedAt }: MapExplorerProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [filters, setFilters] = useState<BrowseFilters>(NO_FILTERS);
  const clearSelection = useCallback(() => setSelection(null), []);

  // A failed load arrives as null: the plate says the stores didn't load
  // rather than showing an empty atlas (AUDIT F-STATE-3).
  const failed = initialData === null;
  const features = useMemo(() => initialData?.features ?? [], [initialData]);

  const bySlug = useMemo(
    () => new Map<string, StoreFeature>(features.map((f) => [f.properties.slug, f])),
    [features],
  );

  // Every filter runs client-side against the data loaded once on mount
  // (CLAUDE.md, Map architecture). The map gets the filtered collection.
  const filtered = useMemo(() => filterFeatures(features, filters), [features, filters]);
  const mapData = useMemo<StoreFeatureCollection>(
    () => ({ type: "FeatureCollection", features: filtered }),
    [filtered],
  );

  // The region the index is set to, for the camera (DESIGN.md, Motion:
  // filter change). Framed on every store in the province, not just the
  // ones the search or specialty leave, so the regional plate is stable.
  const province = filters.province;
  const frame = useMemo(() => {
    if (province === null || province === UNPLACED) {
      return { key: province ?? "national", bounds: "national" as const };
    }
    const bounds = regionBounds(features.filter((f) => f.properties.province === province));
    return { key: province, bounds: bounds ?? ("national" as const) };
  }, [features, province]);

  const selected = selection ? bySlug.get(selection.slug) ?? null : null;

  const selectFromMap = useCallback((slug: string) => setSelection({ slug, focus: false }), []);
  const selectFromIndex = useCallback((slug: string) => setSelection({ slug, focus: true }), []);

  // Escape returns from a store entry to the index.
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, clearSelection]);

  return (
    <Plate
      storeCount={features.length}
      shownCount={hasFilters(filters) ? filtered.length : null}
      failed={failed}
      map={
        <StoreMap
          data={mapData}
          onSelectStore={selectFromMap}
          selected={selected}
          focus={selected && selection?.focus ? selected : null}
          frame={frame}
        />
      }
      panel={
        <MapPanel
          mode={selected ? "entry" : "index"}
          entryKey={selected?.properties.slug ?? null}
          onBack={clearSelection}
          mobileFooter={
            selected ? null : (
              <div className="flex flex-col gap-2 border-t border-ink-faint px-[1.125rem] pt-4 pb-6 text-ui">
                <CreditLinks />
                <Imprint className="text-meta" />
              </div>
            )
          }
        >
          {selected ? (
            <StoreSidebar store={selected.properties} coordinates={selected.geometry.coordinates} />
          ) : failed ? (
            <StoresUnavailable lastSyncedAt={lastSyncedAt} />
          ) : (
            <BrowseSidebar
              features={features}
              filtered={filtered}
              filters={filters}
              onFiltersChange={setFilters}
              onSelectStore={selectFromIndex}
              lastSyncedAt={lastSyncedAt}
            />
          )}
        </MapPanel>
      }
    />
  );
}
