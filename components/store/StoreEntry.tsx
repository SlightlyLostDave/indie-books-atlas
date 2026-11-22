import { InstagramLink, SpecialtyLine, Unknown, joinList } from "@/components/store/EntryParts";
import HoursTable from "@/components/store/HoursTable";
import { displayUrl, formatPhone, provinceName } from "@/lib/format";
import { formatCoordinates } from "@/lib/geo";
import { linkClass } from "@/lib/styles";
import type { PublicStore } from "@/lib/types";

export function placeLine(store: PublicStore): string | null {
  return [store.city, provinceName(store.province)].filter(Boolean).join(", ") || null;
}

function hasParsedHours(store: PublicStore): boolean {
  return store.hours_parsed != null && Object.keys(store.hours_parsed).length > 0;
}

/**
 * What a public entry doesn't record yet, in reading order. With
 * `addressUnavailable` the street address is left out (the caller couldn't
 * load it, so it can't say it's missing).
 */
export function entryGaps(store: PublicStore, { addressUnavailable = false } = {}): string[] {
  const street = [store.address_line1, store.address_line2].filter(Boolean);
  const missing: string[] = [];
  if (!addressUnavailable && street.length === 0) missing.push("street address");
  if (!store.phone) missing.push("telephone");
  if (!store.website) missing.push("website");
  if (!hasParsedHours(store) && !store.hours_raw) missing.push("hours");
  return missing;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-line py-3.5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-6">
      <dt className="text-ui text-ink-dim sm:pt-0.5">{label}</dt>
      <dd className="min-w-0 text-body text-ink">{children}</dd>
    </div>
  );
}

/**
 * The body of a gazetteer entry: the header (name, place, coordinates,
 * description, specialties), the closed notice, and the details under the
 * plate rule, ending with what isn't recorded yet. Used by the public store
 * page and by the admin's read-only preview of it.
 */
export function StoreEntryBody({
  store,
  headingLevel = "h1",
  addressUnavailable = false,
  idPrefix = "store",
}: {
  store: PublicStore;
  /** "h2" when the entry sits inside another page, as in the admin preview. */
  headingLevel?: "h1" | "h2";
  /** The caller has no street address to show (the admin doesn't load it). */
  addressUnavailable?: boolean;
  idPrefix?: string;
}) {
  const Heading = headingLevel;
  const place = placeLine(store);
  const specialties = store.specialties ?? [];
  const closed = store.is_permanently_closed;
  const hasHours = hasParsedHours(store);
  const hasCoords = store.lat != null && store.lng != null;
  const localityLine = [store.city, store.province].filter(Boolean).join(", ");
  const street = addressUnavailable ? [] : ([store.address_line1, store.address_line2].filter(Boolean) as string[]);
  // The address row needs a street. A locality alone is already the place
  // line, so it isn't repeated as an "address" of just "ON" (F-STORE-2).
  const addressLines =
    street.length > 0
      ? [...street, [localityLine, store.postal_code].filter(Boolean).join(" ")].filter(Boolean)
      : [];
  const hasDetails =
    addressLines.length > 0 || store.phone || store.website || store.instagram || hasHours || store.hours_raw;
  const missing = entryGaps(store, { addressUnavailable });
  const detailsHeadingId = `${idPrefix}-details-heading`;

  return (
    <>
      <header>
        <Heading className="font-display text-page font-bold text-balance text-ink">{store.name}</Heading>
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
        aria-labelledby={detailsHeadingId}
        className={closed ? "border-t-2 border-ink" : "mt-8 border-t-2 border-ink"}
      >
        <h2 id={detailsHeadingId} className="sr-only">
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
    </>
  );
}
