import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminAction } from "@/lib/admin/auth";

export interface DashboardMetrics {
  totalStores: number;
  needsReviewCount: number;
  pendingSubmissionsCount: number;
  /** Approximate — see comment below. */
  unverified90DaysCount: number;
  lowQualityCount: number;
  /** Approximate — see comment below. */
  lastSyncDate: string | null;
}

const NINETY_DAYS_AGO = () =>
  new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await requireAdminAction();
  const supabase = createAdminClient();

  const [
    totalStores,
    needsReviewCount,
    pendingSubmissionsCount,
    unverified90DaysCount,
    lowQualityCount,
    lastSync,
  ] = await Promise.all([
    supabase
      .from("stores")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false),
    supabase
      .from("stores")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false)
      .eq("needs_review", true),
    // `submissions`'s exact columns are unverified (SUPABASE_SCHEMA.md flags
    // this) — selecting "*" with head:true avoids assuming a specific
    // column name for the count-only query.
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true }),
    // "Unverified 90+ days" really means "never verified since creation" —
    // there's no `verified_at` column to measure the clock resetting after
    // a later un-verification. Flagged as approximate in the dashboard UI.
    supabase
      .from("stores")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false)
      .eq("is_verified", false)
      .lt("created_at", NINETY_DAYS_AGO()),
    supabase
      .from("stores")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false)
      .lt("data_quality_score", 40),
    // "Last sync date" has no dedicated tracking column — approximated as
    // the most recent pipeline-sourced update. Flagged as approximate in UI.
    supabase
      .from("stores")
      .select("updated_at")
      .neq("source", "manual")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    totalStores: totalStores.count ?? 0,
    needsReviewCount: needsReviewCount.count ?? 0,
    pendingSubmissionsCount: pendingSubmissionsCount.count ?? 0,
    unverified90DaysCount: unverified90DaysCount.count ?? 0,
    lowQualityCount: lowQualityCount.count ?? 0,
    lastSyncDate: (lastSync.data as { updated_at?: string } | null)?.updated_at ?? null,
  };
}
