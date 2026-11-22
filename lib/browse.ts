import type { StoreFeature, StoreFeatureProperties } from "@/lib/types";

/** Provinces west to east, then the territories, as an atlas index lists them. */
export const PROVINCE_ORDER = [
  "BC",
  "AB",
  "SK",
  "MB",
  "ON",
  "QC",
  "NB",
  "NS",
  "PE",
  "NL",
  "YT",
  "NT",
  "NU",
] as const;

/** The province filter value for stores whose province isn't recorded. */
export const UNPLACED = "unplaced";

export interface BrowseFilters {
  query: string;
  /** A province code, `UNPLACED`, or `null` for all of Canada. */
  province: string | null;
  /** Specialty tags; a store matches if it has any of them. */
  specialties: string[];
}

export const NO_FILTERS: BrowseFilters = { query: "", province: null, specialties: [] };

export function hasFilters(f: BrowseFilters): boolean {
  return f.query.trim() !== "" || f.province !== null || f.specialties.length > 0;
}

/** Lower case with accents removed, so "montreal" finds "Montréal". */
export function fold(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Mapbox can hand back array properties as JSON strings; accept both. */
export function specialtiesOf(p: StoreFeatureProperties): string[] {
  const value: unknown = p.specialties;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function matchesQuery(p: StoreFeatureProperties, folded: string): boolean {
  if (!folded) return true;
  return fold(p.name).includes(folded) || (p.city ? fold(p.city).includes(folded) : false);
}

function matchesProvince(p: StoreFeatureProperties, province: string | null): boolean {
  if (province === null) return true;
  if (province === UNPLACED) return !p.province;
  return p.province === province;
}

function matchesSpecialties(p: StoreFeatureProperties, tags: string[]): boolean {
  if (tags.length === 0) return true;
  const own = specialtiesOf(p);
  return tags.some((t) => own.includes(t));
}

type Facet = "province" | "specialties";

/** Features passing every filter, optionally ignoring one facet (for its counts). */
export function filterFeatures(
  features: StoreFeature[],
  f: BrowseFilters,
  ignore?: Facet,
): StoreFeature[] {
  const folded = fold(f.query.trim());
  return features.filter(
    ({ properties: p }) =>
      matchesQuery(p, folded) &&
      (ignore === "province" || matchesProvince(p, f.province)) &&
      (ignore === "specialties" || matchesSpecialties(p, f.specialties)),
  );
}

/** Store counts per province code, plus `UNPLACED`. */
export function provinceCounts(features: StoreFeature[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const { properties: p } of features) {
    const key = p.province ?? UNPLACED;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/** Store counts per specialty tag. */
export function specialtyCounts(features: StoreFeature[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const { properties: p } of features) {
    for (const tag of specialtiesOf(p)) counts[tag] = (counts[tag] ?? 0) + 1;
  }
  return counts;
}
