import { toSchemaOpeningHours } from "@/lib/hours";
import type { PublicStore } from "@/lib/types";

type JsonLd = Record<string, unknown>;

/** Drop null/undefined/empty values so the payload only carries real data. */
function compact(obj: JsonLd): JsonLd {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0),
    ),
  );
}

function instagramUrl(handle: string): string {
  if (/^https?:\/\//i.test(handle)) return handle;
  return `https://www.instagram.com/${handle.replace(/^@/, "")}`;
}

/**
 * schema.org `BookStore` (a `LocalBusiness` → `Store` subtype) for a store
 * page. Google uses this for rich local results.
 */
export function buildStoreJsonLd(store: PublicStore, pageUrl: string): JsonLd {
  const address = compact({
    "@type": "PostalAddress",
    streetAddress:
      [store.address_line1, store.address_line2].filter(Boolean).join(", ") || null,
    addressLocality: store.city,
    addressRegion: store.province,
    postalCode: store.postal_code,
    addressCountry: "CA",
  });

  const geo =
    store.lat != null && store.lng != null
      ? { "@type": "GeoCoordinates", latitude: store.lat, longitude: store.lng }
      : null;

  // `url` is the business's own site when known (Google's LocalBusiness
  // guidance); `@id` stays the atlas page so the entity is stable.
  const url = store.website ?? pageUrl;
  const sameAs = [
    store.website ? pageUrl : null,
    store.instagram ? instagramUrl(store.instagram) : null,
  ].filter(Boolean);

  return compact({
    "@context": "https://schema.org",
    "@type": "BookStore",
    "@id": pageUrl,
    url,
    name: store.name,
    description: store.short_description,
    address,
    geo,
    telephone: store.phone,
    openingHours: toSchemaOpeningHours(store.hours_parsed),
    sameAs,
  });
}

/**
 * Serialize JSON-LD for a `<script>` tag. Escapes `<` so store-supplied
 * strings can't close the script element (see Next's JSON-LD guide).
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
