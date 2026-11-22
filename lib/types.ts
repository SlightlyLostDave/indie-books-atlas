/**
 * Properties of one `stores_geojson` feature, as the live RPC returns them.
 * The payload is kept slim: description, parsed hours and the rest of the
 * address come from `/api/stores/[slug]` when a store is selected.
 */
export interface StoreFeatureProperties {
  id: string | number;
  slug: string;
  name: string;
  city: string | null;
  province: string | null;
  address_line1: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  specialties: string[] | null;
  is_verified: boolean;
  is_featured: boolean;
  data_quality_score: number;
  hours_raw: string | null;
}

export interface StoreFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: StoreFeatureProperties;
}

export interface StoreFeatureCollection {
  type: "FeatureCollection";
  features: StoreFeature[];
}

/** Day keys used by `stores.hours_parsed`. `ph` = public holiday. */
export type DayKey = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su" | "ph";

export interface DayHours {
  open?: string;
  close?: string;
  closed?: boolean;
}

/** Shape of `stores.hours_parsed`. An absent key means unknown, not closed. */
export type HoursParsed = Partial<Record<DayKey, DayHours>>;

/** Public, RLS-visible store record used by `/stores/[slug]`. */
export interface PublicStore {
  id: string | number;
  slug: string;
  name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  short_description: string | null;
  hours_raw: string | null;
  hours_parsed: HoursParsed | null;
  specialties: string[] | null;
  is_permanently_closed: boolean;
  updated_at: string;
}
