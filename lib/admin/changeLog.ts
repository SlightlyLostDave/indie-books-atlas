import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ChangeLogDiff } from "@/lib/admin/types";

/**
 * Every admin write to `stores` also writes a `change_log` row, matching
 * the pipeline's existing audit-trail convention (insert/update/flag_review
 * operations, `diff` shaped as `{"field": {"from": ..., "to": ...}}`).
 */
export async function writeChangeLog(
  storeId: string | number,
  operation: "insert" | "update" | "flag_review",
  diff: ChangeLogDiff | { reason: string },
  source: "admin" = "admin",
) {
  if (Object.keys(diff).length === 0) {
    return;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("change_log").insert({
    store_id: storeId,
    operation,
    source,
    diff,
  });

  if (error) {
    throw new Error(`Failed to write change_log: ${error.message}`);
  }
}

/** Builds a `{"field": {"from": ..., "to": ...}}` diff of only changed fields. */
export function buildDiff<T extends object>(
  before: T,
  after: Partial<T>,
): ChangeLogDiff {
  const diff: ChangeLogDiff = {};
  const beforeRecord = before as Record<string, unknown>;
  const afterRecord = after as Record<string, unknown>;

  for (const key of Object.keys(after)) {
    const fromValue = beforeRecord[key];
    const toValue = afterRecord[key];

    if (JSON.stringify(fromValue) !== JSON.stringify(toValue)) {
      diff[key] = { from: fromValue, to: toValue };
    }
  }

  return diff;
}
