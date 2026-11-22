"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { StoreFeature, StoreFeatureCollection } from "@/lib/types";
import { useTheme } from "@/lib/useTheme";
import { ATLAS_PROJECTION, nationalCamera } from "@/lib/map";
import { motionMs } from "@/lib/motion";
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
  /**
   * The region the index is set to: a province's extent, or "national" for
   * all of Canada. The camera reframes when it changes (a filter change).
   */
  frame: { key: string; bounds: [[number, number], [number, number]] | "national" } | null;
}

/** The canvas's accessible name. The index is the way to reach each store. */
const MAP_LABEL =
  "Map of Canada's independent bookstores. Arrow keys pan, plus and minus zoom. The index panel lists every store on the map.";

const DESKTOP = "(min-width: 768px)";

/** The theme as the document has it right now (not the hydration snapshot). */
function documentTheme(): MapTheme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export default function StoreMap({ data, onSelectStore, selected, focus, frame }: StoreMapProps) {
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
      // A theme switch diffs the new palette in over the page's crossfade.
      paintTransitionMs: motionMs("--dur-move"),
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
          locale: { "Map.Title": MAP_LABEL },
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
          // Reduced motion: the cluster opens without the camera travelling.
          if (motionMs("--dur-move") === 0) map.jumpTo({ center, zoom });
          else map.easeTo({ center, zoom });
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

  // Store select (DESIGN.md, Motion): a store picked from the index. The
  // camera travels to it, clear of the bottom sheet on mobile and close
  // enough that it's a point rather than a cluster. Nearby, it eases; from
  // across the country it flies, out and back in, so the reader sees where
  // the store is. Reduced motion jumps. A map click never moves the camera.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    const [lng, lat] = focus.geometry.coordinates;
    const mobile = !window.matchMedia(DESKTOP).matches;
    const target = {
      center: [lng, lat] as [number, number],
      zoom: Math.max(map.getZoom(), 14),
      padding: mobile ? { top: 0, bottom: Math.round(window.innerHeight * 0.52), left: 0, right: 0 } : 0,
    };
    const cap = motionMs("--dur-camera");
    if (cap === 0) {
      map.jumpTo(target);
      return;
    }
    const near = map.getZoom() >= 9 && map.getBounds()?.contains([lng, lat]);
    if (near) map.easeTo({ ...target, duration: Math.round(cap * 0.45) });
    else map.flyTo({ ...target, duration: cap, curve: 1.6, essential: true });
  }, [focus]);

  // Filter change (DESIGN.md, Motion): choosing a province turns to its
  // regional plate; "All of Canada" turns back to the national one. Other
  // filters only redraw the points, in place. Nothing moves with reduced
  // motion except the frame itself, which jumps.
  const frameKey = frame?.key ?? null;
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !frame) return;
    const container = map.getContainer();
    const duration = Math.round(motionMs("--dur-camera") * 0.6);
    if (frame.bounds === "national") {
      const camera = nationalCamera(container.clientWidth, container.clientHeight);
      if (duration === 0) map.jumpTo(camera);
      else map.easeTo({ ...camera, duration });
      return;
    }
    const mobile = !window.matchMedia(DESKTOP).matches;
    // Clear of the title block (top left) on desktop, and of the sheet's peek on mobile.
    const padding = mobile
      ? { top: 56, right: 24, bottom: 24, left: 24 }
      : { top: 150, right: 48, bottom: 48, left: 48 };
    map.fitBounds(frame.bounds, { padding, maxZoom: 9, duration, essential: true });
    // Only a new frame moves the camera; the bounds object changes identity every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameKey]);

  return <div ref={containerRef} className="h-full w-full" />;
}
