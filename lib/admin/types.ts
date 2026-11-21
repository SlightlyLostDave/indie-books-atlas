/**
 * Fixed specialty vocabulary from SUPABASE_SCHEMA.md — app-enforced, no DB
 * enum. AGENTS.md separately mentions `specialty_tags` has French labels,
 * which suggests it might actually be a live table rather than a constant —
 * if so, a future pass should read this from Supabase instead (for
 * bilingual support). Treated as a hardcoded constant here per explicit
 * scope.
 */
export const SPECIALTY_TAGS = [
  "used",
  "antiquarian",
  "childrens",
  "francophone",
  "indigenous",
  "lgbtq",
  "genre_fiction",
  "academic",
  "art_design",
  "multilingual",
  "comics_graphic",
  "mystery_crime",
  "sci_fi_fantasy",
  "travel",
  "religion_spirit",
  "nature_outdoors",
  "history",
  "feminist",
  "zines",
] as const;

export type SpecialtyTag = (typeof SPECIALTY_TAGS)[number];

export const STORE_SOURCES = [
  "manual",
  "ciba",
  "alq",
  "google_places",
  "osm",
  "wikidata",
  "community_submission",
] as const;

export type StoreSource = (typeof STORE_SOURCES)[number];

/**
 * `id`'s exact DB type (uuid vs bigint) is unverified per
 * SUPABASE_SCHEMA.md's own caveats — typed loosely here and treated as an
 * opaque value everywhere (routing uses `slug`, not `id`). Confirm against
 * a live schema dump before tightening this.
 */
export interface AdminStoreRow {
  id: string | number;
  slug: string;
  name: string;
  lat: number | null;
  lng: number | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  short_description: string | null;
  hours_raw: string | null;
  hours_parsed: Record<string, unknown> | null;
  specialties: string[] | null;
  source: string;
  data_quality_score: number;
  is_verified: boolean;
  needs_review: boolean;
  is_permanently_closed: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  osm_id: number | null;
  google_place_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoresListFilters {
  search?: string;
  province?: string;
  specialty?: string;
  verified?: "verified" | "unverified" | "all";
  needsReview?: boolean;
  maxQualityScore?: number;
  includeDeleted?: boolean;
  sortBy?: "name" | "data_quality_score" | "created_at" | "updated_at";
  sortDirection?: "asc" | "desc";
}

export interface ChangeLogDiff {
  [field: string]: { from: unknown; to: unknown };
}
