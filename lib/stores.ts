import { createClient } from "@/lib/supabase/server";
import type { StoreFeatureCollection } from "@/lib/types";

export async function getStoresGeoJSON(): Promise<StoreFeatureCollection> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stores_geojson");

  if (error) {
    throw new Error(`Failed to load stores_geojson: ${error.message}`);
  }

  return data as StoreFeatureCollection;
}
