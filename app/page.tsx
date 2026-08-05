import MapExplorer from '@/components/map/MapExplorer';
import Footer from '@/components/layout/Footer';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { getStoresGeoJSON } from '@/lib/stores';

export default async function HomePage() {
  const geojson = await getStoresGeoJSON();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Indie Books Atlas
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink-dim">
            A field guide to Canada&apos;s independent bookstores
          </p>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <MapExplorer initialData={geojson} />
      </main>

      <Footer />
    </div>
  );
}
