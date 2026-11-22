import { Suspense } from "react";
import { getStoresList } from "@/lib/admin/stores";
import { StoresTable } from "@/components/admin/StoresTable";
import { StoresFilterBar } from "@/components/admin/StoresFilterBar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LoadingIcon } from "@/components/ui/icons";
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
      <AdminPageHeader title="Stores" lede="The catalogue: search it, filter it, open an entry to work on it." />

      <div className="mt-(--gap-block)">
        <StoresFilterBar />
      </div>

      <div className="mt-(--gap-block)">
        <Suspense
          fallback={
            <p role="status" className="flex items-center gap-2 border-t border-ink-faint pt-4 text-ui text-ink-dim">
              <LoadingIcon className="size-4 text-moss" />
              <span className="font-display italic">Reading the catalogue…</span>
            </p>
          }
        >
          <StoresListResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
