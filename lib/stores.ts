import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { PublicStore, StoreFeatureCollection } from "@/lib/types";

const EMPTY_FEATURE_COLLECTION: StoreFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export async function getStoresGeoJSON(): Promise<StoreFeatureCollection> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("stores_geojson");

    if (error) {
      console.error(`Failed to load stores_geojson: ${error.message}`);
      return EMPTY_FEATURE_COLLECTION;
    }

    return data as StoreFeatureCollection;
  } catch (err) {
    console.error("Failed to load stores_geojson:", err);
    return EMPTY_FEATURE_COLLECTION;
  }
}

// Explicit column selection: skips the raw PostGIS `location` binary
// (`lat`/`lng` cover it) and admin-only fields.
const PUBLIC_STORE_COLUMNS = `
  id, slug, name, address_line1, address_line2, city, province, postal_code, lat, lng,
  phone, website, instagram, short_description, hours_raw, hours_parsed,
  specialties, is_permanently_closed, updated_at
`;

export interface StoreSlugEntry {
  slug: string;
  updated_at: string;
}

/**
 * Every publicly visible store slug, for `generateStaticParams` and the
 * sitemap. RLS limits this to verified stores. Errors degrade to `[]` so a
 * Supabase outage doesn't fail the build; pages then render on demand.
 * Paginated because PostgREST caps each response (1000 rows by default).
 */
export async function getStoreSlugs(): Promise<StoreSlugEntry[]> {
  const PAGE_SIZE = 1000;

  try {
    const supabase = createPublicClient();
    const slugs: StoreSlugEntry[] = [];

    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("stores")
        .select("slug, updated_at")
        .eq("is_deleted", false)
        .order("slug")
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error(`Failed to load store slugs: ${error.message}`);
        return [];
      }

      slugs.push(...((data ?? []) as StoreSlugEntry[]));
      if (!data || data.length < PAGE_SIZE) break;
    }

    return slugs;
  } catch (err) {
    console.error("Failed to load store slugs:", err);
    return [];
  }
}

/**
 * One public store by slug, or `null` if it doesn't exist (or isn't visible
 * under RLS). Query errors throw rather than returning `null`, so ISR keeps
 * serving the last good page instead of caching a 404. Wrapped in `cache()`
 * so `generateMetadata` and the page share a single query per request.
 */
export const getStoreBySlug = cache(
  async (slug: string): Promise<PublicStore | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("stores")
      .select(PUBLIC_STORE_COLUMNS)
      .eq("slug", slug)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load store "${slug}": ${error.message}`);
    }
    if (!data) return null;

    const store = data as unknown as PublicStore;
    return {
      ...store,
      // PostgREST can return `numeric` as a string; normalize for the map.
      lat: store.lat == null ? null : Number(store.lat),
      lng: store.lng == null ? null : Number(store.lng),
    };
  },
);
