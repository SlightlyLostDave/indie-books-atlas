import { NextResponse } from "next/server";
import { getStoreBySlug } from "@/lib/stores";

/**
 * One public store record, for the map sidebar. Read-only, and it reuses the
 * store page's query (`getStoreBySlug`), so the sidebar and `/stores/[slug]`
 * always show the same record. The map's GeoJSON stays slim; this fills in
 * the description, parsed hours and full address when a store is selected.
 *
 * Cached like the store page: each slug is generated on first request and
 * revalidated at most once a day. Nothing is prebuilt, so the build doesn't
 * run a query per store twice. A query error throws (a 500 that isn't
 * cached), so a Supabase hiccup never gets stored as "not found".
 */
export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

export async function GET(_request: Request, ctx: RouteContext<"/api/stores/[slug]">) {
  const { slug } = await ctx.params;
  const store = await getStoreBySlug(slug);
  if (!store) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(store);
}
