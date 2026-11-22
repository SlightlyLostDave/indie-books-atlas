import type { ExpressionSpecification, LayerSpecification, SourceSpecification } from "mapbox-gl";
import { MAP_FONTS } from "@/lib/map";
import type { MapPalette } from "@/lib/map/palette";
import { SYMBOL, SYMBOL_SIZE } from "@/lib/map/symbols";
import type { StoreFeature, StoreFeatureCollection } from "@/lib/types";

/**
 * The stores on the plate: one clustered GeoJSON source (CLAUDE.md, Map
 * architecture) drawn as flat SDF symbols, plus a one-point source for the
 * selected store so it stays visible when its neighbours are clustered.
 */

export const STORE_SOURCE = "stores";
export const SELECTION_SOURCE = "store-selection";

export const STORE_LAYER = {
  clusters: "store-clusters",
  points: "store-points",
  clusterHover: "store-cluster-hover",
  hoverRing: "store-hover-ring",
  hover: "store-hover",
  locator: "store-selected-locator",
  selected: "store-selected",
} as const;

/** Layers a pointer can hover or click. */
export const INTERACTIVE_LAYERS = [STORE_LAYER.clusters, STORE_LAYER.points] as const;

/** A filter that matches nothing, for the hover layers at rest. */
export const NO_HOVER = ["==", ["get", "slug"], ""] as const;
export const NO_CLUSTER_HOVER = ["==", ["get", "cluster_id"], -1] as const;

/**
 * Graduated discs at every zoom: a small radius keeps the Windsor-Quebec
 * corridor a chain of clusters rather than one bubble, and clustering stops
 * at zoom 12, where a city's stores sit apart.
 */
const CLUSTER_RADIUS = 14;
const CLUSTER_MAX_ZOOM = 12;

/**
 * A disc's radius from its count: area grows with the count (sqrt scale)
 * but stops at `cap`, so the corridor's biggest cluster can't cover a region.
 */
function discRadius(cap: number): ExpressionSpecification {
  return ["interpolate", ["linear"], ["sqrt", ["get", "point_count"]], 1.41, 8, 4, 11, 16, cap];
}

/** icon-size for the disc, capped smaller at national zoom than in a city. */
const DISC_SIZE: ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  3,
  ["/", ["*", 2, discRadius(17)], SYMBOL_SIZE.disc],
  8,
  ["/", ["*", 2, discRadius(22)], SYMBOL_SIZE.disc],
];

/** The book's icon-size by zoom, scaled by `k` (zoom must stay the top-level input). */
function bookSize(k = 1): ExpressionSpecification {
  const stops = [3, 0.62, 7, 0.8, 12, 0.95, 16, 1.15];
  return ["interpolate", ["linear"], ["zoom"], ...stops.map((v, i) => (i % 2 ? +(v * k).toFixed(3) : v))];
}
const BOOK_SIZE = bookSize();

const COUNT_SIZE: ExpressionSpecification = ["step", ["get", "point_count"], 10, 10, 11, 100, 12];

export function storeSources(
  data: StoreFeatureCollection,
  selected: StoreFeature | null,
): Record<string, SourceSpecification> {
  return {
    [STORE_SOURCE]: {
      type: "geojson",
      data,
      cluster: true,
      clusterRadius: CLUSTER_RADIUS,
      clusterMaxZoom: CLUSTER_MAX_ZOOM,
      promoteId: "slug",
    },
    [SELECTION_SOURCE]: { type: "geojson", data: selectionData(selected) },
  };
}

export function selectionData(selected: StoreFeature | null): StoreFeatureCollection {
  return { type: "FeatureCollection", features: selected ? [selected] : [] };
}

export function storeLayers(p: MapPalette): LayerSpecification[] {
  const isCluster: ExpressionSpecification = ["has", "point_count"];

  return [
    {
      id: STORE_LAYER.clusters,
      type: "symbol",
      source: STORE_SOURCE,
      filter: isCluster,
      layout: {
        "icon-image": SYMBOL.disc,
        "icon-size": DISC_SIZE,
        "icon-allow-overlap": true,
        // Discs knock out place names they cover: names set beside them
        // (lib/map/style.ts) survive, names under them don't.
        "icon-ignore-placement": false,
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": MAP_FONTS.figures as unknown as string[],
        "text-size": COUNT_SIZE,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
        "symbol-sort-key": ["-", 0, ["get", "point_count"]],
      },
      paint: {
        "icon-color": p.moss,
        "icon-halo-color": p.ground,
        "icon-halo-width": 1.25,
        "text-color": p.ground,
      },
    },
    {
      id: STORE_LAYER.points,
      type: "symbol",
      source: STORE_SOURCE,
      filter: ["!", isCluster],
      layout: {
        "icon-image": SYMBOL.book,
        "icon-size": BOOK_SIZE,
        "icon-allow-overlap": true,
        "icon-ignore-placement": false,
        "icon-padding": 0,
      },
      paint: {
        "icon-color": p.moss,
        "icon-halo-color": p.ground,
        "icon-halo-width": 1.5,
      },
    },
    // Hover: the same disc ringed in ink.
    {
      id: STORE_LAYER.clusterHover,
      type: "symbol",
      source: STORE_SOURCE,
      filter: NO_CLUSTER_HOVER as unknown as ExpressionSpecification,
      layout: {
        "icon-image": SYMBOL.disc,
        "icon-size": DISC_SIZE,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": MAP_FONTS.figures as unknown as string[],
        "text-size": COUNT_SIZE,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "icon-color": p.mossDeep,
        "icon-halo-color": p.ink,
        "icon-halo-width": 1.5,
        "text-color": p.theme === "dark" ? p.ink : p.ground,
      },
    },
    // Hover on a store: the book in ink inside a hairline ring, with its name.
    {
      id: STORE_LAYER.hoverRing,
      type: "symbol",
      source: STORE_SOURCE,
      filter: NO_HOVER as unknown as ExpressionSpecification,
      layout: {
        "icon-image": SYMBOL.ring,
        "icon-size": ["interpolate", ["linear"], ["zoom"], 3, 0.75, 12, 0.95],
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
      paint: { "icon-color": p.ink, "icon-halo-color": p.ground, "icon-halo-width": 1 },
    },
    {
      id: STORE_LAYER.hover,
      type: "symbol",
      source: STORE_SOURCE,
      filter: NO_HOVER as unknown as ExpressionSpecification,
      layout: {
        "icon-image": SYMBOL.book,
        "icon-size": bookSize(1.15),
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "text-field": ["get", "name"],
        "text-font": MAP_FONTS.name as unknown as string[],
        "text-size": 13.5,
        "text-anchor": "left",
        "text-offset": [1.45, 0],
        "text-max-width": 14,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "icon-color": p.ink,
        "icon-halo-color": p.ground,
        "icon-halo-width": 1.5,
        "text-color": p.ink,
        "text-halo-color": p.ground,
        "text-halo-width": 1.5,
      },
    },
    // Selected: amber, the one amber on the plate (DESIGN.md, principle 4).
    // Its own source, so it shows above a cluster at any zoom.
    {
      id: STORE_LAYER.locator,
      type: "symbol",
      source: SELECTION_SOURCE,
      layout: {
        "icon-image": SYMBOL.locator,
        "icon-size": ["interpolate", ["linear"], ["zoom"], 3, 0.85, 12, 1],
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
      paint: { "icon-color": p.amber, "icon-halo-color": p.ground, "icon-halo-width": 1.5 },
    },
    {
      id: STORE_LAYER.selected,
      type: "symbol",
      source: SELECTION_SOURCE,
      layout: {
        "icon-image": SYMBOL.book,
        "icon-size": bookSize(1.2),
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "text-field": ["get", "name"],
        "text-font": MAP_FONTS.name as unknown as string[],
        "text-size": 14,
        "text-anchor": "left",
        "text-offset": [1.9, 0],
        "text-max-width": 14,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "icon-color": p.amber,
        "icon-halo-color": p.ground,
        "icon-halo-width": 2,
        "text-color": p.ink,
        "text-halo-color": p.ground,
        "text-halo-width": 2,
      },
    },
  ];
}

/** The located point on a store page: the selected symbol, alone. */
export function locationLayers(p: MapPalette): LayerSpecification[] {
  return storeLayers(p)
    .filter((l) => l.id === STORE_LAYER.locator || l.id === STORE_LAYER.selected)
    .map((l) => {
      const layer = { ...l, layout: { ...l.layout } } as LayerSpecification & { layout: Record<string, unknown> };
      // The page names the store; the inset only marks it.
      delete layer.layout["text-field"];
      layer.layout["icon-size"] = l.id === STORE_LAYER.locator ? 1.05 : 1.35;
      return layer;
    });
}
