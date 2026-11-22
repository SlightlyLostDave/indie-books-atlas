"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { StoreFeature, StoreFeatureCollection } from "@/lib/types";
import { useTheme } from "@/lib/useTheme";
import { MAP_STYLES } from "@/lib/map";

interface StoreMapProps {
  /** The stores to draw: the full set, or the browse panel's filtered subset. */
  data: StoreFeatureCollection;
  onSelectStore: (slug: string) => void;
  selectedSlug: string | null | undefined;
  /** A store chosen from the index: the camera moves to it. */
  focus: StoreFeature | null;
}

const DESKTOP = "(min-width: 768px)";

/** The theme as the document has it right now (not the hydration snapshot). */
function documentTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

const SOURCE_ID = "stores";

export default function StoreMap({ data, onSelectStore, selectedSlug, focus }: StoreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const selectedSlugRef = useRef<string | null | undefined>(null);
  const theme = useTheme();

  const onSelectStoreRef = useRef(onSelectStore);
  useEffect(() => {
    onSelectStoreRef.current = onSelectStore;
  }, [onSelectStore]);

  const styleRef = useRef<string | null>(null);
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN environment variable.");
      return;
    }
    mapboxgl.accessToken = mapboxToken;

    // Read the theme from the document, not the hydration-time snapshot
    // (always "dark"), so a light visitor gets the light basemap (F-MAP-4).
    styleRef.current = MAP_STYLES[documentTheme()];
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: styleRef.current,
      center: [-96, 56], // roughly centred on Canada
      zoom: 3,
    });
    mapRef.current = map;
    const initializedRef = { current: false };

    const addStoreLayers = () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: dataRef.current,
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 50,
        promoteId: "slug",
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#7c9a55",
          "circle-radius": ["step", ["get", "point_count"], 16, 25, 22, 100, 28],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#100e0b",
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#100e0b",
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#d49a4a",
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            10,
            6,
          ],
          "circle-stroke-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            2.5,
            1.5,
          ],
          "circle-stroke-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#ece4d6",
            "#100e0b",
          ],
        },
      });

      map.on("click", "unclustered-point", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const slug = feature.properties?.slug;
        if (typeof slug === "string") onSelectStoreRef.current(slug);
      });

      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
        if (clusterId == null) return;

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return;
          const geometry = features[0].geometry;
          if (geometry.type !== "Point") return;
          map.easeTo({ center: geometry.coordinates as [number, number], zoom });
        });
      });

      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
    };

    map.once("load", () => {
      addStoreLayers();
      initializedRef.current = true;
    });
    map.on("style.load", () => {
      if (!initializedRef.current) return;
      addStoreLayers();
      if (selectedSlugRef.current) {
        map.setFeatureState({ source: SOURCE_ID, id: selectedSlugRef.current }, { selected: true });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    // The first render after hydration reports the server snapshot ("dark");
    // only act on the theme the document actually has.
    if (!map || theme !== documentTheme()) return;
    const style = MAP_STYLES[theme];
    if (styleRef.current === style) return;
    styleRef.current = style;
    map.setStyle(style);
  }, [theme]);

  // Filters redraw the one GeoJSON source; clusters recompute from it.
  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(data);
  }, [data]);

  // A store picked from the index: move to it, clear of the bottom sheet on
  // mobile, and close enough that it's a point rather than a cluster.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    const [lng, lat] = focus.geometry.coordinates;
    const mobile = !window.matchMedia(DESKTOP).matches;
    map.easeTo({
      center: [lng, lat],
      zoom: Math.max(map.getZoom(), 14),
      padding: mobile ? { top: 0, bottom: Math.round(window.innerHeight * 0.52), left: 0, right: 0 } : 0,
    });
  }, [focus]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applySelection = () => {
      const previousSlug = selectedSlugRef.current;
      if (previousSlug) {
        map.removeFeatureState({ source: SOURCE_ID, id: previousSlug });
      }
      if (selectedSlug) {
        map.setFeatureState({ source: SOURCE_ID, id: selectedSlug }, { selected: true });
      }
      selectedSlugRef.current = selectedSlug ?? null;
    };

    if (map.isStyleLoaded() && map.getSource(SOURCE_ID)) {
      applySelection();
    } else {
      map.once("load", applySelection);
    }
  }, [selectedSlug]);

  return <div ref={containerRef} className="h-full w-full" />;
}
