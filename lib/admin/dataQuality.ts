/**
 * Mirrors the pipeline's documented point formula exactly (SUPABASE_SCHEMA.md).
 * There is no DB trigger computing `data_quality_score` — the pipeline
 * recomputes it in Python on every upsert. This formula now lives in two
 * places (Python pipeline, TypeScript here) with no shared source of truth;
 * keep them in sync manually if the rubric ever changes.
 *
 * Any admin write touching phone/website/hours_raw/short_description/
 * instagram/is_verified MUST recompute the score in the same write, or it
 * silently drifts from reality.
 */
export function computeDataQualityScore(store: {
  phone: string | null;
  website: string | null;
  hours_raw: string | null;
  is_verified: boolean;
  short_description: string | null;
  instagram: string | null;
}): number {
  let score = 0;

  if (store.phone) score += 20;
  if (store.website) score += 20;
  if (store.hours_raw) score += 20;
  if (store.is_verified) score += 20;
  if (store.short_description) score += 10;
  if (store.instagram) score += 10;

  return score;
}
