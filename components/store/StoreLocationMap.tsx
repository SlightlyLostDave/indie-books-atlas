"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_STYLES } from "@/lib/map";
import { useTheme } from "@/lib/useTheme";

interface StoreLocationMapProps {
  lat: number;
  lng: number;
  name: string;
}

function documentTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

/**
 * The store page's location inset: a small street map inside the plate's
 * double neatline, with the located point in amber (the page's one amber).
 * No zoom buttons; it pans, and pinch or double-click zooms. Framing and the
 * caption live on the page.
 */
export default function StoreLocationMap({ lat, lng, name }: StoreLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleRef = useRef<string | null>(null);
  const theme = useTheme();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (mapRef.current || !containerRef.current || !token) return;
    mapboxgl.accessToken = token;

    // The document's theme, not the hydration snapshot (F-MAP-4).
    styleRef.current = MAP_STYLES[documentTheme()];
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: styleRef.current,
      center: [lng, lat],
      zoom: 15,
      scrollZoom: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();

    // A DOM marker (not a style layer) so it survives theme `setStyle` swaps.
    // The single store map is not the main map, so BRIEF 6.3 doesn't apply.
    // Drawn as a locator: an amber point inside a hairline ring.
    const el = document.createElement("div");
    el.className = "grid size-7 place-items-center rounded-full border border-amber";
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", name);
    const dot = document.createElement("span");
    dot.className = "block size-2.5 rounded-full border-2 border-bg bg-amber box-content";
    el.appendChild(dot);
    new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, name, token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || theme !== documentTheme()) return;
    const style = MAP_STYLES[theme];
    if (styleRef.current === style) return;
    styleRef.current = style;
    map.setStyle(style);
  }, [theme]);

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
