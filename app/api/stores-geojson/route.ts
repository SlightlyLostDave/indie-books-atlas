import { NextResponse } from "next/server";
import { getStoresGeoJSON } from "@/lib/stores";

export const revalidate = 3600;

export async function GET() {
  const geojson = await getStoresGeoJSON();
  // A failed query is a 503, not an empty collection that reads as "no stores".
  if (!geojson) {
    return NextResponse.json({ error: "stores_unavailable" }, { status: 503 });
  }
  return NextResponse.json(geojson);
}
