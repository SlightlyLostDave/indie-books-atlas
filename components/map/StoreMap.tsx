"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { StoreFeatureCollection, StoreFeatureProperties } from "@/lib/types";
import { useTheme } from "@/lib/useTheme";
import { MAP_STYLES } from "@/lib/map";

interface StoreMapProps {
  initialData: StoreFeatureCollection;
  onSelectStore: (properties: StoreFeatureProperties) => void;
  selectedSlug: string | null | undefined;
}

const SOURCE_ID = "stores";

export default function StoreMap({ initialData, onSelectStore, selectedSlug }: StoreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const selectedSlugRef = useRef<string | null | undefined>(null);
  const theme = useTheme();

  const onSelectStoreRef = useRef(onSelectStore);
  useEffect(() => {
    onSelectStoreRef.current = onSelectStore;
  }, [onSelectStore]);

  const initialDataRef = useRef(initialData);
  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const initialThemeRef = useRef(theme);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN environment variable.");
      return;
    }
    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLES[initialThemeRef.current],
      center: [-96, 56], // roughly centred on Canada
      zoom: 3,
    });
    mapRef.current = map;
    const initializedRef = { current: false };

    const addStoreLayers = () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: initialDataRef.current,
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
        onSelectStoreRef.current(feature.properties as StoreFeatureProperties);
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
    if (!map || !map.isStyleLoaded()) return;
    map.setStyle(MAP_STYLES[theme]);
  }, [theme]);

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
