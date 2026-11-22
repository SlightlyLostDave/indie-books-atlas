import MapExplorer from '@/components/map/MapExplorer';
import { getLastSyncedAt } from '@/lib/freshness';
import { getStoresGeoJSON } from '@/lib/stores';

export default async function HomePage() {
  const [geojson, lastSyncedAt] = await Promise.all([
    getStoresGeoJSON(),
    getLastSyncedAt(),
  ]);

  return (
    <main>
      <MapExplorer
        initialData={geojson}
        lastSyncedAt={lastSyncedAt?.toISOString() ?? null}
      />
    </main>
  );
}
