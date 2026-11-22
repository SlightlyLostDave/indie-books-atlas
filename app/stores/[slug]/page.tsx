import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell, { type Crumb } from "@/components/layout/PageShell";
import { StoreEntryBody, entryGaps, placeLine } from "@/components/store/StoreEntry";
import LazyStoreLocationMap from "@/components/store/LazyStoreLocationMap";
import { buttonVariants } from "@/components/ui/button";
import { provinceName } from "@/lib/format";
import { directionsUrl as directionsFor, formatCoordinates } from "@/lib/geo";
import { SITE_URL } from "@/lib/site";
import { getStoreBySlug, getStoreSlugs } from "@/lib/stores";
import { linkClass, quietLinkClass } from "@/lib/styles";
import { buildStoreJsonLd, serializeJsonLd } from "@/lib/structuredData";

// Rebuild each store page at most once a day; new slugs render on demand.
export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = await getStoreSlugs();
  return slugs.map(({ slug }) => ({ slug }));
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

export default async function StorePage({ params }: PageProps<"/stores/[slug]">) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const pageUrl = `${SITE_URL}/stores/${store.slug}`;
  const jsonLd = buildStoreJsonLd(store, pageUrl);
  const hasCoords = store.lat != null && store.lng != null;
  const missing = entryGaps(store);
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
            <StoreEntryBody store={store} />
          </div>

          <aside aria-label="Location" className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-3">
            {hasCoords ? (
              <figure>
                {/* The plate's double neatline: outer line-strong, inner ink-faint */}
                <div className="border border-line-strong p-1.5">
                  <div className="h-72 border border-ink-faint lg:h-80">
                    <LazyStoreLocationMap lat={store.lat!} lng={store.lng!} name={store.name} />
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
