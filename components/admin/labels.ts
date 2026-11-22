/**
 * Display names for values the admin shows. Presentation only: the stored
 * values (lib/admin/types.ts) are unchanged.
 */
const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  ciba: "CIBA",
  alq: "ALQ",
  google_places: "Google Places",
  osm: "OpenStreetMap",
  wikidata: "Wikidata",
  community_submission: "Community",
};

/** "osm" → "OpenStreetMap". Unknown sources pass through. */
export function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

/** A count as a figure: "1,072". */
export function figure(n: number): string {
  return n.toLocaleString("en-CA");
}
