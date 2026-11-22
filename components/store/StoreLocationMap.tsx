"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ATLAS_PROJECTION } from "@/lib/map";
import { readMapPalette, type MapTheme } from "@/lib/map/palette";
import { buildAtlasStyle, loadBaseStyle } from "@/lib/map/style";
import { loadBoundary } from "@/lib/map/boundary";
import { isAtlasSymbol, registerSymbols } from "@/lib/map/symbols";
import { SELECTION_SOURCE, locationLayers, selectionData } from "@/lib/map/storeLayers";
import { useTheme } from "@/lib/useTheme";

interface StoreLocationMapProps {
  lat: number;
  lng: number;
  name: string;
}

function documentTheme(): MapTheme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

/** Neighbourhood framing: a few blocks either way, with street names. */
const INSET_ZOOM = 14.6;

/**
 * The store page's location inset: the atlas basemap at neighbourhood scale
 * inside the plate's double neatline, with the store as the plate's selected
 * symbol (amber, the page's one amber) and a scale bar. No zoom buttons; it
 * pans, and pinch or double-click zooms. Framing and the caption live on the
 * page.
 *
 * The point is a symbol layer that's part of the style object, so a theme
 * swap (which diffs the new style in) keeps it without a DOM marker.
 */
export default function StoreLocationMap({ lat, lng, name }: StoreLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const themeRef = useRef<MapTheme | null>(null);
  const theme = useTheme();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const pointRef = useRef({ lat, lng, name });
  useEffect(() => {
    pointRef.current = { lat, lng, name };
  }, [lat, lng, name]);

  const styleFor = async (t: MapTheme, accessToken: string) => {
    const [base, boundary] = await Promise.all([loadBaseStyle(t, accessToken), loadBoundary()]);
    const palette = readMapPalette(t);
    // Beyond the conic's domain (the polar cap, the cut at the antimeridian)
    // nothing is drawn, so the container shows through: make it sea.
    containerRef.current?.style.setProperty("background-color", palette.water);
    const { lat, lng, name } = pointRef.current;
    return buildAtlasStyle(base, palette, boundary, {
      sources: {
        [SELECTION_SOURCE]: {
          type: "geojson",
          data: selectionData({
            type: "Feature",
            geometry: { type: "Point", coordinates: [lng, lat] },
            // Only the name is read (for the accessible label); the rest is unused here.
            properties: { name } as never,
          }),
        },
      },
      layers: locationLayers(palette),
    });
  };

  useEffect(() => {
    if (mapRef.current || !containerRef.current || !token) return;
    mapboxgl.accessToken = token;
    let cancelled = false;
    let map: mapboxgl.Map | null = null;
    const container = containerRef.current;

    // The document's theme, not the hydration snapshot (F-MAP-4).
    const initialTheme = documentTheme();
    themeRef.current = initialTheme;

    styleFor(initialTheme, token)
      .then((style) => {
        if (cancelled) return;
        map = new mapboxgl.Map({
          container,
          style,
          projection: ATLAS_PROJECTION,
          center: [lng, lat],
          zoom: INSET_ZOOM,
          minZoom: 10,
          scrollZoom: false,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          attributionControl: false,
        });
        map.touchZoomRotate.disableRotation();
        map.addControl(new mapboxgl.ScaleControl({ maxWidth: 88, unit: "metric" }), "bottom-left");
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
        map.on("style.load", () => registerSymbols(map!));
        map.on("styleimagemissing", (e: { id: string }) => {
          if (isAtlasSymbol(e.id)) registerSymbols(map!);
        });
        mapRef.current = map;
      })
      .catch((err) => console.error("Map style failed to load.", err));

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !token || theme !== documentTheme() || themeRef.current === theme) return;
    themeRef.current = theme;
    let stale = false;
    styleFor(theme, token).then((style) => {
      if (!stale && mapRef.current === map) map.setStyle(style);
    });
    return () => {
      stale = true;
    };
  }, [theme, token]);

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg-step">
        <span className="font-display text-ui text-ink-faint italic">Map unavailable</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      aria-label={`Map showing the location of ${name}`}
    />
  );
}
