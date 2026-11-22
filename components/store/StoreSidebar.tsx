"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LoadingIcon } from "@/components/ui/icons";
import { Completeness, InstagramLink, SpecialtyLine, Unknown, joinList } from "@/components/store/EntryParts";
import HoursTable from "@/components/store/HoursTable";
import { specialtiesOf } from "@/lib/browse";
import { displayUrl, formatPhone, provinceName } from "@/lib/format";
import { directionsUrl, formatCoordinates } from "@/lib/geo";
import { forgetStoreRecord, loadStoreRecord } from "@/lib/storeRecord";
import { creditLinkClass, linkClass } from "@/lib/styles";
import type { PublicStore, StoreFeatureProperties } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StoreSidebarProps {
  store: StoreFeatureProperties;
  /** [lng, lat] of the map point. */
  coordinates: [number, number] | null;
}

function correctionHref(store: { slug: string; id: string | number; name: string }) {
  return `/submit?${new URLSearchParams({ store: store.slug, id: String(store.id), name: store.name })}`;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 border-b border-line py-(--row-y)">
      <dt className="text-ui text-ink-dim">{label}</dt>
      <dd className="min-w-0 text-ui text-ink">{children}</dd>
    </div>
  );
}

/**
 * A selected store as a short gazetteer entry. What the map payload already
 * holds (name, place, coordinates, specialties, completeness) renders at once;
 * the full record (description, address, parsed hours) is read from
 * `/api/stores/[slug]` and fills in below. Only known fields get a row. The
 * rest fold into one quiet "Not yet recorded" line with a correction link.
 *
 * The panel container and "← Back to the index" belong to MapPanel.
 */
export default function StoreSidebar({ store, coordinates }: StoreSidebarProps) {
  const specialties = specialtiesOf(store);
  const place = [store.city, provinceName(store.province)].filter(Boolean).join(", ");
  const [lng, lat] = coordinates ?? [null, null];

  return (
    <article className="flex flex-1 flex-col">
      <header>
        <h2 data-panel-focus tabIndex={-1} className="font-display text-title font-bold text-balance text-ink outline-offset-4">
          {store.name}
        </h2>
        <p className="mt-2 font-display text-body text-ink-dim italic">
          {place || <Unknown>Place not yet recorded</Unknown>}
        </p>
        {lat != null && lng != null && (
          <p className="mt-1 font-mono text-meta text-ink-quiet tabular-nums">{formatCoordinates(lat, lng)}</p>
        )}
      </header>

      <SpecialtyLine tags={specialties} className="mt-4 text-ui" />
      <Completeness score={store.data_quality_score} className="mt-3" />

      <Suspense key={store.slug} fallback={<Reading />}>
        <Details feature={store} coordinates={coordinates} />
      </Suspense>

      <p className="mt-auto pt-10 text-meta text-ink-quiet">
        Location and listing data ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className={creditLinkClass}
        >
          OpenStreetMap contributors
        </a>
        , ODbL.
      </p>
    </article>
  );
}

function Reading() {
  return (
    <p role="status" className="mt-6 flex items-center gap-2 border-t border-ink-faint pt-4 text-ui text-ink-dim">
      <LoadingIcon className="size-4 text-moss" />
      <span className="font-display italic">Reading the entry…</span>
    </p>
  );
}

function Details({
  feature,
  coordinates,
}: {
  feature: StoreFeatureProperties;
  coordinates: [number, number] | null;
}) {
  const [, retry] = useState(0);
  const result = use(loadStoreRecord(feature.slug));
  const fullEntry = `/stores/${feature.slug}`;

  if (result.status !== "ok") {
    // What the map payload holds is already above; this says what's missing
    // and why, and offers the two ways on. Announced, since it replaces the
    // "Reading the entry…" status.
    return (
      <div role="status" className="mt-6 border-t border-ink-faint pt-4 text-ui text-ink-dim">
        {result.status === "missing" ? (
          <p>
            <Unknown className="text-ink-dim">This entry isn&apos;t in the public record any more.</Unknown> It may
            have been withdrawn since the map loaded.
          </p>
        ) : (
          <p>
            <Unknown className="text-ink-dim">The rest of this entry didn&apos;t load.</Unknown> Its address, hours and
            description come from the database, which didn&apos;t answer just now.
          </p>
        )}
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {result.status === "error" && (
            <button
              type="button"
              className={linkClass}
              onClick={() => {
                forgetStoreRecord(feature.slug);
                retry((n) => n + 1);
              }}
            >
              Try again
            </button>
          )}
          <Link href={fullEntry} className={linkClass}>
            Open the full entry
          </Link>
        </p>
      </div>
    );
  }

  return <Record store={result.store} coordinates={coordinates} fullEntry={fullEntry} />;
}

function Record({
  store,
  coordinates,
  fullEntry,
}: {
  store: PublicStore;
  coordinates: [number, number] | null;
  fullEntry: string;
}) {
  const locality = [store.city, store.province].filter(Boolean).join(", ");
  const street = [store.address_line1, store.address_line2].filter(Boolean) as string[];
  const hasHours = store.hours_parsed != null && Object.keys(store.hours_parsed).length > 0;

  const missing: string[] = [];
  if (street.length === 0) missing.push("address");
  if (!store.phone) missing.push("telephone");
  if (!store.website) missing.push("website");
  if (!hasHours && !store.hours_raw) missing.push("hours");

  const lat = coordinates?.[1] ?? store.lat;
  const lng = coordinates?.[0] ?? store.lng;

  return (
    <div className="mt-5">
      {store.short_description && (
        <p className="mb-5 text-body text-ink-dim">{store.short_description}</p>
      )}

      {(street.length > 0 || store.phone || store.website || store.instagram || hasHours || store.hours_raw) && (
        <dl className="border-t border-ink-faint">
          {street.length > 0 && (
            <DetailRow label="Address">
              <address className="not-italic">
                {street.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                {(locality || store.postal_code) && (
                  <span className="block text-ink-dim">
                    {[locality, store.postal_code].filter(Boolean).join(" ")}
                  </span>
                )}
              </address>
            </DetailRow>
          )}
          {store.phone && (
            <DetailRow label="Telephone">
              <a href={`tel:${store.phone}`} className={cn(linkClass, "tabular-nums")}>
                {formatPhone(store.phone)}
              </a>
            </DetailRow>
          )}
          {store.website && (
            <DetailRow label="Website">
              <a href={store.website} target="_blank" rel="noopener noreferrer" className={cn(linkClass, "break-words")}>
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
            <div className="border-b border-line py-(--row-y)">
              <dt className="text-ui text-ink-dim">Hours</dt>
              <dd className="mt-1.5 -ml-2.5">
                {hasHours ? (
                  <HoursTable hours={store.hours_parsed!} size="ui" markToday={!store.is_permanently_closed} />
                ) : (
                  <span className="pl-2.5 text-ui text-ink-dim">Hours vary. Call ahead to confirm.</span>
                )}
              </dd>
            </div>
          )}
        </dl>
      )}

      {missing.length > 0 && (
        <p className="mt-4 text-ui text-ink-dim">
          <Unknown>Not yet recorded: {joinList(missing, "or")}.</Unknown>{" "}
          Know {missing.length > 1 ? "them" : "it"}?{" "}
          <Link href={correctionHref(store)} className={linkClass}>
            Suggest a correction
          </Link>
          .
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={fullEntry} className={buttonVariants({ variant: "default" })}>
          Open the full entry
        </Link>
        {lat != null && lng != null && (
          <a
            href={directionsUrl(lat, lng)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            Directions ↗
          </a>
        )}
      </div>
    </div>
  );
}
