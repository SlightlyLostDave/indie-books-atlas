import { Suspense } from "react";
import { getStoresList } from "@/lib/admin/stores";
import { StoresTable } from "@/components/admin/StoresTable";
import { StoresFilterBar } from "@/components/admin/StoresFilterBar";
import type { StoresListFilters } from "@/lib/admin/types";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    province?: string;
    specialty?: string;
    verified?: string;
    needsReview?: string;
    maxQualityScore?: string;
  }>;
}

async function StoresListResults({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: StoresListFilters = {
    search: params.search,
    province: params.province,
    specialty: params.specialty,
    verified:
      params.verified === "verified" || params.verified === "unverified"
        ? params.verified
        : "all",
    needsReview: params.needsReview === "true",
    maxQualityScore: params.maxQualityScore ? Number(params.maxQualityScore) : undefined,
  };

  const stores = await getStoresList(filters);

  return <StoresTable data={stores} />;
}

export default function AdminStoresPage({ searchParams }: PageProps) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">Stores</h1>
      <p className="mt-2 text-ink-dim">
        Search, filter, and triage the store catalog.
      </p>

      <div className="mt-6">
        <StoresFilterBar />
      </div>

      <div className="mt-6">
        <Suspense fallback={<p className="text-ink-dim">Loading…</p>}>
          <StoresListResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
