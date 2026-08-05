"use client";

import { useState } from "react";
import StoreMap from "@/components/map/StoreMap";
import BrowseSidebar from "@/components/map/BrowseSidebar";
import StoreSidebar from "@/components/store/StoreSidebar";
import type { StoreFeatureCollection, StoreFeatureProperties } from "@/lib/types";

interface MapExplorerProps {
  initialData: StoreFeatureCollection;
}

export default function MapExplorer({ initialData }: MapExplorerProps) {
  const [selectedStore, setSelectedStore] = useState<StoreFeatureProperties | null>(null);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden rounded-md border border-line">
      <div className="relative flex-1">
        <StoreMap
          initialData={initialData}
          onSelectStore={setSelectedStore}
          selectedSlug={selectedStore?.slug}
        />
      </div>
      {selectedStore ? (
        <StoreSidebar store={selectedStore} onClose={() => setSelectedStore(null)} />
      ) : (
        <BrowseSidebar initialData={initialData} />
      )}
    </div>
  );
}
