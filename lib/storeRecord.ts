import type { PublicStore } from "@/lib/types";

export type StoreRecordResult =
  | { status: "ok"; store: PublicStore }
  | { status: "missing" }
  | { status: "error" };

/**
 * Client-side cache of full store records, keyed by slug. Each record is
 * fetched once per visit, so selecting a store again is instant. The cached
 * value is a promise that never rejects, so it can be read with React's
 * `use()` inside a Suspense boundary.
 */
const records = new Map<string, Promise<StoreRecordResult>>();

async function fetchRecord(slug: string): Promise<StoreRecordResult> {
  try {
    const res = await fetch(`/api/stores/${encodeURIComponent(slug)}`);
    if (res.status === 404) return { status: "missing" };
    if (!res.ok) return { status: "error" };
    return { status: "ok", store: (await res.json()) as PublicStore };
  } catch {
    return { status: "error" };
  }
}

export function loadStoreRecord(slug: string): Promise<StoreRecordResult> {
  let record = records.get(slug);
  if (!record) {
    record = fetchRecord(slug);
    records.set(slug, record);
  }
  return record;
}

/** Drop a failed record so the next read fetches it again. */
export function forgetStoreRecord(slug: string): void {
  records.delete(slug);
}
