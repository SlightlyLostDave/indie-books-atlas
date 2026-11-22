"use client";

import { useCallback, useEffect, useState } from "react";
import StoreMap from "@/components/map/StoreMap";
import BrowseSidebar from "@/components/map/BrowseSidebar";
import StoreSidebar from "@/components/store/StoreSidebar";
import Plate from "@/components/layout/Plate";
import MapPanel from "@/components/layout/MapPanel";
import { CreditLinks, Imprint } from "@/components/layout/Footer";
import type { StoreFeatureCollection, StoreFeatureProperties } from "@/lib/types";

interface MapExplorerProps {
  initialData: StoreFeatureCollection;
  /** ISO timestamp of the last successful data sync, if known. */
  lastSyncedAt: string | null;
}

export default function MapExplorer({ initialData, lastSyncedAt }: MapExplorerProps) {
  const [selectedStore, setSelectedStore] = useState<StoreFeatureProperties | null>(null);
  const clearSelection = useCallback(() => setSelectedStore(null), []);

  // Escape returns from a store entry to the index.
  useEffect(() => {
    if (!selectedStore) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedStore, clearSelection]);

  return (
    <Plate
      storeCount={initialData.features.length}
      map={
        <StoreMap
          initialData={initialData}
          onSelectStore={setSelectedStore}
          selectedSlug={selectedStore?.slug}
        />
      }
      panel={
        <MapPanel
          mode={selectedStore ? "entry" : "index"}
          entryKey={selectedStore?.slug ?? null}
          onBack={clearSelection}
          mobileFooter={
            selectedStore ? null : (
              <div className="flex flex-col gap-2 border-t border-ink-faint px-[1.125rem] pt-4 pb-6 text-ui">
                <CreditLinks />
                <Imprint className="text-meta" />
              </div>
            )
          }
        >
          {selectedStore ? (
            <StoreSidebar store={selectedStore} />
          ) : (
            <BrowseSidebar initialData={initialData} lastSyncedAt={lastSyncedAt} />
          )}
        </MapPanel>
      }
    />
  );
}
