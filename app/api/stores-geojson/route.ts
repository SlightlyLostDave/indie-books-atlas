import { NextResponse } from "next/server";
import { getStoresGeoJSON } from "@/lib/stores";

export const revalidate = 3600;

export async function GET() {
  const geojson = await getStoresGeoJSON();
  return NextResponse.json(geojson);
}
