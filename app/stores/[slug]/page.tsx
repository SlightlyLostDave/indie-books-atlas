import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell, { type Crumb } from "@/components/layout/PageShell";
import { InstagramLink, SpecialtyLine, Unknown, joinList } from "@/components/store/EntryParts";
import HoursTable from "@/components/store/HoursTable";
import StoreLocationMap from "@/components/store/StoreLocationMap";
import { buttonVariants } from "@/components/ui/button";
import { displayUrl, formatPhone, provinceName } from "@/lib/format";
import { directionsUrl as directionsFor, formatCoordinates } from "@/lib/geo";
import { SITE_URL } from "@/lib/site";
import { getStoreBySlug, getStoreSlugs } from "@/lib/stores";
import { linkClass, quietLinkClass } from "@/lib/styles";
import { buildStoreJsonLd, serializeJsonLd } from "@/lib/structuredData";
import type { PublicStore } from "@/lib/types";

// Rebuild each store page at most once a day; new slugs render on demand.
export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = await getStoreSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

function placeLine(store: PublicStore): string | null {
  return [store.city, provinceName(store.province)].filter(Boolean).join(", ") || null;
}

export async function generateMetadata({
  params,
}: PageProps<"/stores/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return { title: "Store not found — Indie Books Atlas" };

  const place = placeLine(store);
  const title = place
    ? `${store.name} — Independent bookstore in ${place}`
    : `${store.name} — Independent bookstore`;
  const description =
    store.short_description ??
    `${store.name} is an independent bookstore${place ? ` in ${place}` : ""}. Address, hours, phone, directions and specialties on Indie Books Atlas.`;
  const path = `/stores/${store.slug}`;

  return {
    title: `${title} | Indie Books Atlas`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: "Indie Books Atlas",
      title,
      description,
      locale: "en_CA",
    },
  };
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-line py-3.5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-6">
      <dt className="text-ui text-ink-dim sm:pt-0.5">{label}</dt>
      <dd className="min-w-0 text-body text-ink">{children}</dd>
    </div>
  );
}

export default async function StorePage({ params }: PageProps<"/stores/[slug]">) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const pageUrl = `${SITE_URL}/stores/${store.slug}`;
  const jsonLd = buildStoreJsonLd(store, pageUrl);
  const place = placeLine(store);
  const specialties = store.specialties ?? [];
  const closed = store.is_permanently_closed;
  const hasHours = store.hours_parsed != null && Object.keys(store.hours_parsed).length > 0;
  const hasCoords = store.lat != null && store.lng != null;
  const localityLine = [store.city, store.province].filter(Boolean).join(", ");
  const street = [store.address_line1, store.address_line2].filter(Boolean) as string[];
  // The address row needs a street. A locality alone is already the place
  // line, so it isn't repeated as an "address" of just "ON" (F-STORE-2).
  const addressLines =
    street.length > 0
      ? [...street, [localityLine, store.postal_code].filter(Boolean).join(" ")].filter(Boolean)
      : [];
  const hasDetails =
    addressLines.length > 0 || store.phone || store.website || store.instagram || hasHours || store.hours_raw;

  const missing: string[] = [];
  if (street.length === 0) missing.push("street address");
  if (!store.phone) missing.push("telephone");
  if (!store.website) missing.push("website");
  if (!hasHours && !store.hours_raw) missing.push("hours");
  // Most entries are a name and a point; the slip says so and leads.
  const isStub = missing.length >= 3;

  const directionsUrl = hasCoords ? directionsFor(store.lat!, store.lng!) : null;
  const osmEditUrl = hasCoords
    ? `https://www.openstreetmap.org/edit#map=19/${store.lat}/${store.lng}`
    : "https://www.openstreetmap.org/";
  const crumbs: Crumb[] = [
    { label: provinceName(store.province) ?? "Unplaced" },
    ...(store.city ? [{ label: store.city }] : []),
    { label: store.name },
  ];
  const correctionUrl = `/submit?${new URLSearchParams({
    store: store.slug,
    id: String(store.id),
    name: store.name,
  })}`;

  return (
    <PageShell crumbs={crumbs}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-(--gutter) pt-10 pb-16 md:pt-16">
        {/* A gazetteer entry: the entry in the main column, the location
            inset beside it, then the correction slip and credits. On narrow
            screens the inset sits between the details and the slip. */}
        <article className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <header>
              <h1 className="font-display text-page font-bold text-balance text-ink">{store.name}</h1>
              <p className="mt-3 font-display text-lede text-ink-dim italic">
                {place ?? <Unknown>Place not yet recorded</Unknown>}
              </p>
              {hasCoords && (
                <p className="mt-1.5 font-mono text-meta text-ink-faint tabular-nums">
                  {formatCoordinates(store.lat!, store.lng!)}
                </p>
              )}
              {store.short_description && (
                <p className="mt-6 max-w-[40rem] text-prose text-ink-dim">{store.short_description}</p>
              )}
              <SpecialtyLine tags={specialties} className="mt-5 text-body" />
            </header>

            {closed && (
              // The plate rule below closes the notice, so it only needs a top rule.
              <p className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-danger py-3 text-body">
                <span className="font-medium text-danger">
                  <span aria-hidden="true">× </span>Permanently closed
                </span>
                <span className="text-ink-dim">This store has closed. Its listing stays up as a record.</span>
              </p>
            )}

            {/* The plate rule under the entry header */}
            <section
              aria-labelledby="store-details-heading"
              className={closed ? "border-t-2 border-ink" : "mt-8 border-t-2 border-ink"}
            >
              <h2 id="store-details-heading" className="sr-only">
                Store details
              </h2>
              {hasDetails && (
                <dl>
                  {addressLines.length > 0 && (
                    <DetailRow label="Address">
                      <address className="not-italic">
                        {addressLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </address>
                    </DetailRow>
                  )}

                  {store.phone && (
                    <DetailRow label="Telephone">
                      <a href={`tel:${store.phone}`} className={`${linkClass} tabular-nums`}>
                        {formatPhone(store.phone)}
                      </a>
                    </DetailRow>
                  )}

                  {store.website && (
                    <DetailRow label="Website">
                      <a
                        href={store.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${linkClass} break-words`}
                      >
                        {displayUrl(store.website)} ↗
                      </a>
                    </DetailRow>
                  )}

                  {store.instagram && (
                    <DetailRow label="Instagram">
                      <InstagramLink handle={store.instagram} />
                    </DetailRow>
                  )}

                  {(hasHours || store.hours_raw) && (
                    <DetailRow label="Hours">
                      {hasHours ? (
                        <HoursTable hours={store.hours_parsed!} markToday={!closed} className="-ml-2.5 max-w-md" />
                      ) : (
                        <span className="text-ink-dim">Hours vary — call ahead to confirm.</span>
                      )}
                    </DetailRow>
                  )}
                </dl>
              )}

              {missing.length > 0 && (
                <p className="mt-4 text-prose">
                  <Unknown>Not yet recorded: {joinList(missing)}.</Unknown>
                </p>
              )}
            </section>
          </div>

          <aside aria-label="Location" className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-3">
            {hasCoords ? (
              <figure>
                {/* The plate's double neatline: outer line-strong, inner ink-faint */}
                <div className="border border-line-strong p-1.5">
                  <div className="h-72 border border-ink-faint lg:h-80">
                    <StoreLocationMap lat={store.lat!} lng={store.lng!} name={store.name} />
                  </div>
                </div>
                <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 text-ui">
                  <span className="font-mono text-meta text-ink-dim tabular-nums">
                    {formatCoordinates(store.lat!, store.lng!)}
                  </span>
                  {directionsUrl && (
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      Get directions ↗
                    </a>
                  )}
                </figcaption>
              </figure>
            ) : (
              <figure>
                {/* Dashed: not on the plate (DESIGN.md, Shape) */}
                <div className="grid h-56 place-items-center border border-dashed border-ink-faint p-6 text-center">
                  <p className="font-display text-prose text-ink-faint italic">
                    {store.province ? `${provinceName(store.province)}. ` : ""}Exact location not yet recorded.
                  </p>
                </div>
                <figcaption className="mt-3 text-ui">
                  <Link href={correctionUrl} className={linkClass}>
                    Know where it is? Tell us.
                  </Link>
                </figcaption>
              </figure>
            )}
          </aside>

          <div className="min-w-0 lg:col-start-1">
            {/* The correction slip: one of the few boxed things in the system */}
            <section
              aria-labelledby="slip-heading"
              className="flex flex-col gap-5 border border-t-2 border-ink-faint border-t-ink bg-bg-raised p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6"
            >
              <div className="max-w-md">
                <h2 id="slip-heading" className="font-display text-heading font-semibold text-ink">
                  {isStub ? "This entry is a stub" : "Something wrong or missing?"}
                </h2>
                <p className="mt-2 text-ui text-ink-dim">
                  {isStub
                    ? "Most entries in the atlas start like this: a name and a place on the map. If you know this store, you can fill it in."
                    : "Hours change and shops move. A person reads every correction before it changes anything."}
                </p>
              </div>
              <Link
                href={correctionUrl}
                className={buttonVariants({
                  variant: isStub ? "default" : "outline",
                  className: "self-start sm:self-auto",
                })}
              >
                Suggest a correction
              </Link>
            </section>

            <div className="mt-6 flex flex-col gap-2 text-meta text-ink-faint sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <p>
                Location and listing data ©{" "}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={quietLinkClass}
                >
                  OpenStreetMap contributors
                </a>
                , available under the ODbL.
              </p>
              <a href={osmEditUrl} target="_blank" rel="noopener noreferrer" className={`shrink-0 ${quietLinkClass}`}>
                Improve this listing on OpenStreetMap ↗
              </a>
            </div>
          </div>
        </article>
      </main>
    </PageShell>
  );
}
