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

/** Small, single-store map for `/stores/[slug]`. */
export default function StoreLocationMap({ lat, lng, name }: StoreLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const theme = useTheme();
  const initialThemeRef = useRef(theme);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (mapRef.current || !containerRef.current || !token) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLES[initialThemeRef.current],
      center: [lng, lat],
      zoom: 15,
      scrollZoom: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    // DOM marker (not a style layer) so it survives theme `setStyle` swaps.
    const el = document.createElement("div");
    el.className = "h-4 w-4 rounded-full border-2 border-[#100e0b] bg-[#d49a4a] shadow-md";
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", name);
    new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, name, token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setStyle(MAP_STYLES[theme]);
  }, [theme]);

  if (!token) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center rounded-md border border-line bg-bg-step">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-faint">
          Map unavailable
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[280px] w-full overflow-hidden rounded-md border border-line"
      aria-label={`Map showing the location of ${name}`}
    />
  );
}
