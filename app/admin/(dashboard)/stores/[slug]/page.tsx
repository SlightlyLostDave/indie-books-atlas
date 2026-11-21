import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/admin/stores";
import { StoreEditForm } from "@/components/admin/StoreEditForm";
import { StoreStatusActions } from "@/components/admin/StoreStatusActions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminStoreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {store.name}
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink-faint">
            /{store.slug} · quality {store.data_quality_score} · source {store.source}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <StoreEditForm store={store} />
        <StoreStatusActions store={store} />
      </div>
    </div>
  );
}
