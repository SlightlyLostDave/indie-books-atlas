import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminAction } from "@/lib/admin/auth";
import { computeDataQualityScore } from "@/lib/admin/dataQuality";
import { buildDiff, writeChangeLog } from "@/lib/admin/changeLog";
import type { AdminStoreRow, StoresListFilters } from "@/lib/admin/types";
import type { StoreEditInput } from "@/lib/admin/schemas";

// Explicit column selection — excludes the raw PostGIS `location` geography
// binary, unneeded here since `lat`/`lng` already cover the same data.
const STORE_COLUMNS = `
  id, slug, name, lat, lng, city, province, postal_code,
  phone, website, instagram, short_description, hours_raw, hours_parsed,
  specialties, source, data_quality_score, is_verified, needs_review,
  is_permanently_closed, is_deleted, deleted_at, osm_id, google_place_id,
  created_at, updated_at
`;

/**
 * Reads deliberately do NOT swallow errors into an empty-state fallback the
 * way `lib/stores.ts`'s public `getStoresGeoJSON()` does. An admin silently
 * seeing "0 stores" because a query failed is misleading for a triage tool
 * — let errors propagate to `app/admin/(dashboard)/error.tsx` instead.
 */
export async function getStoresList(
  filters: StoresListFilters = {},
): Promise<AdminStoreRow[]> {
  await requireAdminAction();
  const supabase = createAdminClient();

  let query = supabase.from("stores").select(STORE_COLUMNS);

  if (!filters.includeDeleted) {
    query = query.eq("is_deleted", false);
  }
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,city.ilike.%${filters.search}%`,
    );
  }
  if (filters.province) {
    query = query.eq("province", filters.province);
  }
  if (filters.specialty) {
    query = query.contains("specialties", [filters.specialty]);
  }
  if (filters.verified === "verified") {
    query = query.eq("is_verified", true);
  } else if (filters.verified === "unverified") {
    query = query.eq("is_verified", false);
  }
  if (filters.needsReview) {
    query = query.eq("needs_review", true);
  }
  if (typeof filters.maxQualityScore === "number") {
    query = query.lte("data_quality_score", filters.maxQualityScore);
  }

  const sortBy = filters.sortBy ?? "name";
  const sortDirection = filters.sortDirection ?? "asc";
  query = query.order(sortBy, { ascending: sortDirection === "asc" });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load stores list: ${error.message}`);
  }

  return (data ?? []) as unknown as AdminStoreRow[];
}

export async function getStoreBySlug(
  slug: string,
): Promise<AdminStoreRow | null> {
  await requireAdminAction();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stores")
    .select(STORE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load store "${slug}": ${error.message}`);
  }

  return data as unknown as AdminStoreRow | null;
}

async function getStoreOrThrow(slug: string): Promise<AdminStoreRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stores")
    .select(STORE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Store "${slug}" not found`);
  }

  return data as unknown as AdminStoreRow;
}

export async function updateStore(slug: string, input: StoreEditInput) {
  await requireAdminAction();
  const supabase = createAdminClient();
  const before = await getStoreOrThrow(slug);

  const normalized = {
    ...input,
    website: input.website || null,
  };

  const data_quality_score = computeDataQualityScore({
    phone: normalized.phone,
    website: normalized.website,
    hours_raw: normalized.hours_raw,
    is_verified: before.is_verified,
    short_description: normalized.short_description,
    instagram: normalized.instagram,
  });

  const { error } = await supabase
    .from("stores")
    .update({ ...normalized, data_quality_score })
    .eq("slug", slug);

  if (error) {
    throw new Error(`Failed to update store: ${error.message}`);
  }

  const diff = buildDiff(before, { ...normalized, data_quality_score });
  await writeChangeLog(before.id, "update", diff);
}

export async function setVerified(slug: string, value: boolean) {
  await requireAdminAction();
  const supabase = createAdminClient();
  const before = await getStoreOrThrow(slug);

  const data_quality_score = computeDataQualityScore({
    phone: before.phone,
    website: before.website,
    hours_raw: before.hours_raw,
    is_verified: value,
    short_description: before.short_description,
    instagram: before.instagram,
  });

  const { error } = await supabase
    .from("stores")
    .update({ is_verified: value, data_quality_score })
    .eq("slug", slug);

  if (error) {
    throw new Error(`Failed to set verification: ${error.message}`);
  }

  const diff = buildDiff(before, { is_verified: value, data_quality_score });
  await writeChangeLog(before.id, "update", diff);
}

/** One-directional only — the pipeline is the only thing that ever sets this true. */
export async function clearNeedsReview(slug: string) {
  await requireAdminAction();
  const supabase = createAdminClient();
  const before = await getStoreOrThrow(slug);

  if (!before.needs_review) {
    return;
  }

  const { error } = await supabase
    .from("stores")
    .update({ needs_review: false })
    .eq("slug", slug);

  if (error) {
    throw new Error(`Failed to clear needs_review: ${error.message}`);
  }

  await writeChangeLog(
    before.id,
    "update",
    buildDiff(before, { needs_review: false }),
  );
}

export async function setPermanentlyClosed(
  slug: string,
  value: boolean,
  reason?: string,
) {
  await requireAdminAction();
  const supabase = createAdminClient();
  const before = await getStoreOrThrow(slug);

  const { error } = await supabase
    .from("stores")
    .update({ is_permanently_closed: value })
    .eq("slug", slug);

  if (error) {
    throw new Error(`Failed to set permanently-closed: ${error.message}`);
  }

  await writeChangeLog(
    before.id,
    "update",
    { ...buildDiff(before, { is_permanently_closed: value }) },
    "admin",
  );

  if (reason) {
    await writeChangeLog(before.id, "flag_review", { reason });
  }
}

export async function softDeleteStore(slug: string) {
  await requireAdminAction();
  const supabase = createAdminClient();
  const before = await getStoreOrThrow(slug);
  const deleted_at = new Date().toISOString();

  const { error } = await supabase
    .from("stores")
    .update({ is_deleted: true, deleted_at })
    .eq("slug", slug);

  if (error) {
    throw new Error(`Failed to delete store: ${error.message}`);
  }

  await writeChangeLog(
    before.id,
    "update",
    buildDiff(before, { is_deleted: true, deleted_at }),
  );
}

export async function restoreStore(slug: string) {
  await requireAdminAction();
  const supabase = createAdminClient();
  const before = await getStoreOrThrow(slug);

  const { error } = await supabase
    .from("stores")
    .update({ is_deleted: false, deleted_at: null })
    .eq("slug", slug);

  if (error) {
    throw new Error(`Failed to restore store: ${error.message}`);
  }

  await writeChangeLog(
    before.id,
    "update",
    buildDiff(before, { is_deleted: false, deleted_at: null }),
  );
}
