"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { StoreFeature, StoreFeatureCollection } from "@/lib/types";
import { useTheme } from "@/lib/useTheme";
import { ATLAS_PROJECTION, nationalCamera } from "@/lib/map";
import { loadBoundary } from "@/lib/map/boundary";
import { readMapPalette, type MapTheme } from "@/lib/map/palette";
import { buildAtlasStyle, loadBaseStyle } from "@/lib/map/style";
import { isAtlasSymbol, registerSymbols } from "@/lib/map/symbols";
import {
  INTERACTIVE_LAYERS,
  NO_CLUSTER_HOVER,
  NO_HOVER,
  SELECTION_SOURCE,
  STORE_LAYER,
  STORE_SOURCE,
  selectionData,
  storeLayers,
  storeSources,
} from "@/lib/map/storeLayers";

interface StoreMapProps {
  /** The stores to draw: the full set, or the browse panel's filtered subset. */
  data: StoreFeatureCollection;
  onSelectStore: (slug: string) => void;
  /** The selected store, drawn above everything (even when it's in a cluster). */
  selected: StoreFeature | null;
  /** A store chosen from the index: the camera moves to it. */
  focus: StoreFeature | null;
}

const DESKTOP = "(min-width: 768px)";

/** The theme as the document has it right now (not the hydration snapshot). */
function documentTheme(): MapTheme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export default function StoreMap({ data, onSelectStore, selected, focus }: StoreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const theme = useTheme();
  const themeRef = useRef<MapTheme | null>(null);

  const onSelectStoreRef = useRef(onSelectStore);
  useEffect(() => {
    onSelectStoreRef.current = onSelectStore;
  }, [onSelectStore]);

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  /** The whole style for a theme: basemap, mask and stores, ready before the first frame. */
  const styleFor = async (t: MapTheme, token: string) => {
    const [base, boundary] = await Promise.all([loadBaseStyle(t, token), loadBoundary()]);
    const palette = readMapPalette(t);
    // Beyond the conic's domain (the polar cap, the cut at the antimeridian)
    // nothing is drawn, so the container shows through: make it sea.
    containerRef.current?.style.setProperty("background-color", palette.water);
    return buildAtlasStyle(base, palette, boundary, {
      sources: storeSources(dataRef.current, selectedRef.current),
      layers: storeLayers(palette),
    });
  };

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN environment variable.");
      return;
    }
    mapboxgl.accessToken = token;

    let cancelled = false;
    let map: mapboxgl.Map | null = null;
    const container = containerRef.current;

    // Read the theme from the document, not the hydration-time snapshot
    // (always "dark"), so a light visitor gets the light plate (F-MAP-4).
    const initialTheme = documentTheme();
    themeRef.current = initialTheme;

    styleFor(initialTheme, token)
      .then((style) => {
        if (cancelled) return;
        map = new mapboxgl.Map({
          container,
          style,
          projection: ATLAS_PROJECTION,
          ...nationalCamera(container.clientWidth, container.clientHeight),
          minZoom: 1.5,
          maxZoom: 18,
          // A plate is read north-up: no rotation or tilt.
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
        });
        map.touchZoomRotate.disableRotation();
        mapRef.current = map;
        wire(map);
      })
      .catch((err) => console.error("Map style failed to load.", err));

    function wire(map: mapboxgl.Map) {
      map.on("style.load", () => registerSymbols(map));
      // Filters or a selection that changed while the style was loading.
      map.once("load", () => {
        (map.getSource(STORE_SOURCE) as mapboxgl.GeoJSONSource | undefined)?.setData(dataRef.current);
        (map.getSource(SELECTION_SOURCE) as mapboxgl.GeoJSONSource | undefined)?.setData(
          selectionData(selectedRef.current),
        );
      });
      map.on("styleimagemissing", (e: { id: string }) => {
        if (isAtlasSymbol(e.id)) registerSymbols(map);
      });

      // Hover: filter-driven layers, updated only when the target changes.
      let hoverSlug = "";
      let hoverCluster = -1;
      const setHover = (slug: string, clusterId: number) => {
        if (slug !== hoverSlug) {
          hoverSlug = slug;
          const filter = slug ? ["==", ["get", "slug"], slug] : NO_HOVER;
          for (const id of [STORE_LAYER.hover, STORE_LAYER.hoverRing]) {
            if (map.getLayer(id)) map.setFilter(id, filter as mapboxgl.FilterSpecification);
          }
        }
        if (clusterId !== hoverCluster) {
          hoverCluster = clusterId;
          const filter = clusterId >= 0 ? ["==", ["get", "cluster_id"], clusterId] : NO_CLUSTER_HOVER;
          if (map.getLayer(STORE_LAYER.clusterHover)) {
            map.setFilter(STORE_LAYER.clusterHover, filter as mapboxgl.FilterSpecification);
          }
        }
        map.getCanvas().style.cursor = slug || clusterId >= 0 ? "pointer" : "";
      };

      map.on("mousemove", (e) => {
        const layers = INTERACTIVE_LAYERS.filter((id) => map.getLayer(id));
        const hit = layers.length ? map.queryRenderedFeatures(e.point, { layers }) : [];
        // Prefer a store over a cluster drawn beneath it.
        const point = hit.find((f) => f.layer?.id === STORE_LAYER.points);
        const cluster = hit.find((f) => f.layer?.id === STORE_LAYER.clusters);
        const slug = typeof point?.properties?.slug === "string" ? point.properties.slug : "";
        const clusterId = !slug && cluster ? Number(cluster.properties?.cluster_id ?? -1) : -1;
        setHover(slug, clusterId);
      });
      map.on("mouseout", () => setHover("", -1));
      // Zooming changes which features exist; drop a stale hover.
      map.on("zoomstart", () => setHover("", -1));

      map.on("click", (e) => {
        const layers = INTERACTIVE_LAYERS.filter((id) => map.getLayer(id));
        if (!layers.length) return;
        const hit = map.queryRenderedFeatures(e.point, { layers });
        const point = hit.find((f) => f.layer?.id === STORE_LAYER.points);
        const slug = point?.properties?.slug;
        if (typeof slug === "string") {
          onSelectStoreRef.current(slug);
          return;
        }
        const cluster = hit.find((f) => f.layer?.id === STORE_LAYER.clusters);
        const clusterId = cluster?.properties?.cluster_id;
        if (clusterId == null || cluster?.geometry.type !== "Point") return;
        const center = cluster.geometry.coordinates as [number, number];
        const source = map.getSource(STORE_SOURCE) as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return;
          map.easeTo({ center, zoom });
        });
      });
    }

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Theme: rebuild the style from the new tokens and diff it in, so the
  // stores, the cluster state and the camera stay put.
  useEffect(() => {
    const map = mapRef.current;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    // The first render after hydration reports the server snapshot ("dark");
    // only act on the theme the document actually has.
    if (!map || !token || theme !== documentTheme() || themeRef.current === theme) return;
    themeRef.current = theme;
    let stale = false;
    styleFor(theme, token).then((style) => {
      // setStyle diffs by default: only paint changes are applied.
      if (!stale && mapRef.current === map) map.setStyle(style);
    });
    return () => {
      stale = true;
    };
  }, [theme]);

  // Filters redraw the one GeoJSON source; clusters recompute from it.
  useEffect(() => {
    const source = mapRef.current?.getSource(STORE_SOURCE) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(data);
  }, [data]);

  useEffect(() => {
    const source = mapRef.current?.getSource(SELECTION_SOURCE) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(selectionData(selected));
  }, [selected]);

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

  return <div ref={containerRef} className="h-full w-full" />;
}
