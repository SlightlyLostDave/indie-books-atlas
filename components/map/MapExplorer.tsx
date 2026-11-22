"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StoreMap from "@/components/map/StoreMap";
import BrowseSidebar from "@/components/map/BrowseSidebar";
import StoreSidebar from "@/components/store/StoreSidebar";
import Plate from "@/components/layout/Plate";
import MapPanel from "@/components/layout/MapPanel";
import { CreditLinks, Imprint } from "@/components/layout/Footer";
import { NO_FILTERS, filterFeatures, type BrowseFilters } from "@/lib/browse";
import type { StoreFeature, StoreFeatureCollection } from "@/lib/types";

interface MapExplorerProps {
  initialData: StoreFeatureCollection;
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

  const features = initialData.features;
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
      map={
        <StoreMap
          data={mapData}
          onSelectStore={selectFromMap}
          selectedSlug={selected?.properties.slug}
          focus={selected && selection?.focus ? selected : null}
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
