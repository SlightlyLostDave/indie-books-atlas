import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell, { type Crumb } from "@/components/layout/PageShell";
import StoreLocationMap from "@/components/store/StoreLocationMap";
import { displayUrl, formatPhone, provinceName } from "@/lib/format";
import { formatHoursRows } from "@/lib/hours";
import { SITE_URL } from "@/lib/site";
import { specialtyLabel } from "@/lib/specialties";
import { getStoreBySlug, getStoreSlugs } from "@/lib/stores";
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
    <div className="grid grid-cols-1 gap-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[7rem_1fr] sm:gap-4">
      <dt className="pt-0.5 font-mono text-xs uppercase tracking-widest text-ink-faint">
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-ink">{children}</dd>
    </div>
  );
}

const linkClass = "text-amber underline-offset-4 hover:underline";
const monoLinkClass = "font-mono text-xs uppercase tracking-widest text-amber hover:underline";

export default async function StorePage({ params }: PageProps<"/stores/[slug]">) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const pageUrl = `${SITE_URL}/stores/${store.slug}`;
  const jsonLd = buildStoreJsonLd(store, pageUrl);
  const place = placeLine(store);
  const specialties = store.specialties ?? [];
  const hoursRows = formatHoursRows(store.hours_parsed);
  const hasCoords = store.lat != null && store.lng != null;
  const localityLine = [store.city, store.province].filter(Boolean).join(", ");
  const addressLines = [
    store.address_line1,
    store.address_line2,
    [localityLine, store.postal_code].filter(Boolean).join(" "),
  ].filter(Boolean);

  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`
    : null;
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

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <article>
          <header>
            {place && (
              <p className="font-display text-prose italic text-ink-dim">{place}</p>
            )}
            <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
              {store.name}
            </h1>
            {store.short_description && (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-dim">
                {store.short_description}
              </p>
            )}
            {specialties.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Specialties">
                {specialties.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-moss-deep/40 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-moss"
                  >
                    {specialtyLabel(tag)}
                  </li>
                ))}
              </ul>
            )}
          </header>

          {store.is_permanently_closed && (
            <p
              role="status"
              className="mt-8 rounded-md border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-ink"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-danger">
                Permanently closed
              </span>
              <span className="mx-2 text-ink-faint">·</span>
              This store has closed. Its listing stays up as a record.
            </p>
          )}

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_minmax(0,24rem)]">
            <section
              aria-labelledby="store-details-heading"
              className="rounded-md border border-line bg-bg-raised px-6 py-2"
            >
              <h2 id="store-details-heading" className="sr-only">
                Store details
              </h2>
              <dl>
                {(addressLines.length > 0 || directionsUrl) && (
                  <DetailRow label="Address">
                    {addressLines.length > 0 && (
                      <address className="not-italic">
                        {addressLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </address>
                    )}
                    {directionsUrl && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-2 inline-block ${monoLinkClass}`}
                      >
                        Get directions ↗
                      </a>
                    )}
                  </DetailRow>
                )}

                {store.phone && (
                  <DetailRow label="Phone">
                    <a href={`tel:${store.phone}`} className={linkClass}>
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
                      className={`${linkClass} break-all`}
                    >
                      {displayUrl(store.website)} ↗
                    </a>
                  </DetailRow>
                )}

                <DetailRow label="Hours">
                  {hoursRows.length > 0 ? (
                    <table className="text-sm">
                      <tbody>
                        {hoursRows.map((row) => (
                          <tr key={row.days}>
                            <th
                              scope="row"
                              className="py-0.5 pr-6 text-left font-normal text-ink-dim"
                            >
                              {row.days}
                            </th>
                            <td className="py-0.5 text-ink">{row.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <span className="text-ink-dim">
                      {store.hours_raw
                        ? "Hours vary — call ahead to confirm."
                        : "Hours not listed yet."}
                    </span>
                  )}
                </DetailRow>
              </dl>
            </section>

            {hasCoords && (
              <section aria-label="Location map">
                <StoreLocationMap lat={store.lat!} lng={store.lng!} name={store.name} />
              </section>
            )}
          </div>

          <aside className="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl text-sm leading-relaxed text-ink-dim">
              <p>
                Location and listing data ©{" "}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  OpenStreetMap contributors
                </a>
                , available under the ODbL.
              </p>
              <a
                href={osmEditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-2 inline-block ${monoLinkClass}`}
              >
                Improve this listing on OpenStreetMap ↗
              </a>
            </div>
            <Link href={correctionUrl} className={`shrink-0 ${monoLinkClass}`}>
              Suggest a correction →
            </Link>
          </aside>
        </article>
      </main>
    </PageShell>
  );
}
