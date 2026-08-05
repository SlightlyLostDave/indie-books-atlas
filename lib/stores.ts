import { createClient } from "@/lib/supabase/server";
import type { StoreFeatureCollection } from "@/lib/types";

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
