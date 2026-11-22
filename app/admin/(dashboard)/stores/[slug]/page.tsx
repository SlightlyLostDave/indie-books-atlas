import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/admin/stores";
import { StoreEditForm } from "@/components/admin/StoreEditForm";
import { StoreStatusActions } from "@/components/admin/StoreStatusActions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusMark, storeStatuses } from "@/components/admin/StatusMark";
import { sourceLabel } from "@/components/admin/labels";
import { StoreEntryBody } from "@/components/store/StoreEntry";
import { Unknown } from "@/components/store/EntryParts";
import { provinceName } from "@/lib/format";
import { linkClass } from "@/lib/styles";
import type { AdminStoreRow } from "@/lib/admin/types";
import type { HoursParsed, PublicStore } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * The admin row as the public entry reads it. The admin doesn't load the
 * street address (address_line1/2 aren't in lib/admin's column list), so
 * the preview leaves it out rather than calling it missing.
 */
function asPublicStore(store: AdminStoreRow): PublicStore {
  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    address_line1: null,
    address_line2: null,
    city: store.city,
    province: store.province,
    postal_code: store.postal_code,
    lat: store.lat,
    lng: store.lng,
    phone: store.phone,
    website: store.website,
    instagram: store.instagram,
    short_description: store.short_description,
    hours_raw: store.hours_raw,
    hours_parsed: store.hours_parsed as HoursParsed | null,
    specialties: store.specialties,
    is_permanently_closed: store.is_permanently_closed,
    updated_at: store.updated_at,
  };
}

export default async function AdminStoreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  const place = [store.city, provinceName(store.province)].filter(Boolean).join(", ");

  return (
    <div>
      <AdminPageHeader
        back={{ href: "/admin/stores", label: "Stores" }}
        title={store.name}
        lede={place || <Unknown>Place not yet recorded</Unknown>}
      >
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-ui text-ink-dim">
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            {storeStatuses(store).map((status) => (
              <StatusMark key={status} status={status} />
            ))}
          </span>
          <span>
            Source: <span className="text-ink">{sourceLabel(store.source)}</span>
          </span>
          <span className="font-mono text-meta text-ink-faint">{store.slug}</span>
          {!store.is_deleted && (
            <a href={`/stores/${store.slug}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Public page ↗
            </a>
          )}
        </div>
      </AdminPageHeader>

      <div className="mt-(--gap-block)">
        <StoreEditForm store={store} aside={<StoreStatusActions store={store} />} />
      </div>

      <section aria-labelledby="preview-heading" className="mt-(--gap-section) max-w-[60rem]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t-2 border-ink pt-3">
          <h2 id="preview-heading" className="font-display text-heading font-semibold text-ink">
            As it reads on the atlas
          </h2>
          <p className="font-display text-ui text-ink-dim italic">Read-only, from the saved record</p>
        </div>
        <ul className="mt-2 flex flex-col gap-1 text-meta text-ink-dim">
          <li>Unsaved edits don&apos;t show here. The public page rebuilds daily, so it can trail a save by up to a day.</li>
          <li>The street address isn&apos;t loaded in the admin, so it&apos;s left out. The map inset is left out too.</li>
          {store.is_deleted && <li className="text-ink">This store is deleted, so the public atlas doesn&apos;t show it.</li>}
        </ul>

        {/* The entry on a plate: double neatline, page ground inside. */}
        <div className="mt-(--gap-block) border border-line-strong p-1.5" inert>
          <div className="border border-ink-faint bg-bg px-(--gutter) py-8">
            <StoreEntryBody store={asPublicStore(store)} headingLevel="h2" addressUnavailable idPrefix="preview" />
          </div>
        </div>
      </section>
    </div>
  );
}
