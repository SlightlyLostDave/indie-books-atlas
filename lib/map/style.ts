import type {
  ExpressionSpecification,
  FilterSpecification,
  LayerSpecification,
  SourceSpecification,
  StyleSpecification,
} from "mapbox-gl";
import { ATLAS_PROJECTION, BASE_STYLES, MAP_FONTS } from "@/lib/map";
import type { AtlasBoundary } from "@/lib/map/boundary";
import type { MapPalette, MapTheme } from "@/lib/map/palette";

/**
 * The atlas basemap: Mapbox's light-v11 / dark-v11 rewritten from the design
 * tokens before the first frame (option b of the Phase 6 brief). The base
 * style's layer ids are stable within v11; an id this module doesn't find is
 * skipped, so a Mapbox change degrades to the stock look rather than failing.
 */

const baseStyles = new Map<MapTheme, Promise<StyleSpecification>>();

/** Fetch (once per theme per page) the stock style JSON to rewrite. */
export function loadBaseStyle(theme: MapTheme, token: string): Promise<StyleSpecification> {
  let style = baseStyles.get(theme);
  if (!style) {
    style = fetch(`https://api.mapbox.com/styles/v1/${BASE_STYLES[theme]}?access_token=${token}`).then((r) => {
      if (!r.ok) throw new Error(`Mapbox style ${BASE_STYLES[theme]}: ${r.status}`);
      return r.json() as Promise<StyleSpecification>;
    });
    style.catch(() => baseStyles.delete(theme));
    baseStyles.set(theme, style);
  }
  return style;
}

const CA: FilterSpecification = ["==", ["get", "iso_3166_1"], "CA"];
/** Shared features (admin lines, lakes) carry codes like "CA-US". */
const TOUCHES_CA: ExpressionSpecification = ["in", "CA", ["to-string", ["get", "iso_3166_1"]]];

/**
 * In the territories settlements are few and far apart, so at national zoom
 * Mapbox labels every hamlet and the plate's top half fills with names.
 * There, only territorial capitals keep a label until zoom 5. (Keyed on the
 * feature's territory, not a polygon: Mapbox's `within` misplaces symbols
 * under a conic projection.)
 */
const IN_ARCTIC: ExpressionSpecification = ["match", ["get", "iso_3166_2"], ["CA-YT", "CA-NT", "CA-NU"], true, false];
/** National (2) and provincial or territorial (4) capitals, as Streets v8 codes them. */
const IS_CAPITAL: ExpressionSpecification = ["match", ["to-string", ["get", "capital"]], ["2", "4"], true, false];

/**
 * Settlement names set beside the point, as an atlas sets them, so a store
 * disc on the city doesn't knock its name out: Mapbox tries each anchor in
 * turn. From zoom 9 the name sits over the place itself.
 */
const BESIDE_SYMBOLS = {
  "text-variable-anchor": ["left", "right", "top", "bottom", "top-left", "bottom-right"],
  "text-radial-offset": ["step", ["zoom"], 1.5, 6, 1.2, 9, 0],
  "text-justify": "auto",
} as const;

const MAJOR_ROADS = ["motorway", "motorway_link", "trunk", "trunk_link"];

type Layer = LayerSpecification & { filter?: FilterSpecification; layout?: Record<string, unknown>; paint?: Record<string, unknown> };

/**
 * The base style keeps settlements with filterrank <= 2, which drops Montréal
 * (rank 3) at every zoom. With only Canada labelled there's room for rank 3.
 */
function relaxFilterrank(filter: FilterSpecification | undefined): FilterSpecification | undefined {
  return filter && (JSON.parse(JSON.stringify(filter).replace('["<=",["get","filterrank"],2]', '["<=",["get","filterrank"],3]')) as FilterSpecification);
}

function and(filter: FilterSpecification | undefined, ...more: FilterSpecification[]): FilterSpecification {
  return (filter ? ["all", filter, ...more] : ["all", ...more]) as FilterSpecification;
}

/** Overrides keyed by base layer id. Each receives a copy and edits it in place. */
function layerEdits(p: MapPalette): Record<string, (l: Layer) => void> {
  const labelPaint = (l: Layer, color: string) => {
    l.paint = { ...l.paint, "text-color": color, "text-halo-color": p.halo, "text-halo-width": 1.25, "text-halo-blur": 0 };
  };
  const roadColor: ExpressionSpecification = [
    "case",
    CA as ExpressionSpecification,
    ["match", ["get", "class"], MAJOR_ROADS, p.roadMajor, p.road],
    p.roadAbroad,
  ];
  const road = (l: Layer) => {
    l.paint = { ...l.paint, "line-color": roadColor };
  };
  const minorPath = (l: Layer) => {
    l.paint = { ...l.paint, "line-color": ["case", CA as ExpressionSpecification, p.road, p.roadAbroad] };
  };
  const hide = (l: Layer) => {
    l.layout = { ...l.layout, visibility: "none" };
  };

  return {
    // The background is the sea: land is drawn from the boundary fills, so
    // the polar cap north of the tiles' 85° limit reads as Arctic Ocean.
    land: (l) => {
      l.paint = { "background-color": p.water };
    },
    "national-park": (l) => {
      l.paint = { ...l.paint, "fill-color": p.park };
    },
    landuse: (l) => {
      l.paint = {
        ...l.paint,
        "fill-color": [
          "match",
          ["get", "class"],
          ["park", "wood", "grass", "scrub"],
          p.park,
          "glacier",
          p.water,
          p.building,
        ],
      };
    },
    waterway: (l) => {
      l.paint = { ...l.paint, "line-color": p.water };
    },
    water: (l) => {
      l.paint = { "fill-color": p.water };
    },
    "land-structure-polygon": (l) => {
      l.paint = { ...l.paint, "fill-color": p.land };
    },
    "land-structure-line": (l) => {
      l.paint = { ...l.paint, "line-color": p.land };
    },
    "aeroway-polygon": (l) => {
      l.paint = { ...l.paint, "fill-color": p.building };
    },
    "aeroway-line": (l) => {
      l.paint = { ...l.paint, "line-color": p.building };
    },
    building: (l) => {
      l.paint = {
        ...l.paint,
        "fill-color": ["case", CA as ExpressionSpecification, p.building, p.neighbour],
        "fill-outline-color": ["case", CA as ExpressionSpecification, p.road, p.neighbour],
      };
    },
    "tunnel-simple": road,
    "road-simple": road,
    "bridge-simple": road,
    "bridge-case-simple": (l) => {
      l.paint = { ...l.paint, "line-color": p.land };
    },
    "tunnel-path-trail": minorPath,
    "tunnel-path-cycleway-piste": minorPath,
    "tunnel-path": minorPath,
    "tunnel-steps": minorPath,
    "tunnel-pedestrian": minorPath,
    "road-path-trail": minorPath,
    "road-path-cycleway-piste": minorPath,
    "road-path": minorPath,
    "road-steps": minorPath,
    "road-pedestrian": minorPath,
    "bridge-path-trail": minorPath,
    "bridge-path-cycleway-piste": minorPath,
    "bridge-path": minorPath,
    "bridge-steps": minorPath,
    "bridge-pedestrian": minorPath,
    "road-rail": (l) => {
      l.paint = { ...l.paint, "line-color": ["case", CA as ExpressionSpecification, p.road, p.roadAbroad] };
    },
    "bridge-rail": (l) => {
      l.paint = { ...l.paint, "line-color": ["case", CA as ExpressionSpecification, p.road, p.roadAbroad] };
    },

    // Boundaries: flat rules, no blurred casing (BRIEF 2.4). Provinces only.
    "admin-0-boundary-bg": hide,
    "admin-1-boundary-bg": hide,
    "admin-0-boundary": (l) => {
      l.paint = {
        "line-color": p.boundary,
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.9, 12, 1.75],
      };
    },
    "admin-0-boundary-disputed": (l) => {
      l.paint = { ...l.paint, "line-color": p.boundary };
    },
    "admin-1-boundary": (l) => {
      l.filter = and(l.filter, TOUCHES_CA as FilterSpecification);
      l.paint = {
        "line-color": p.provinceBoundary,
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.6, 12, 1.25],
        "line-dasharray": ["step", ["zoom"], ["literal", [3, 2]], 7, ["literal", [5, 2.5, 1, 2.5]]],
      };
    },

    // Labels. Political names in tracked caps (DESIGN.md, Type: the only
    // tracked caps in the system); settlements are names, so Playfair;
    // water, parks and landforms in the marginal italic.
    "country-label": (l) => {
      l.filter = and(l.filter, CA);
      l.maxzoom = 4;
      l.layout = {
        ...l.layout,
        "text-font": MAP_FONTS.political,
        "text-transform": "uppercase",
        "text-letter-spacing": 0.45,
        "text-size": ["interpolate", ["linear"], ["zoom"], 2, 12, 4, 16],
        "icon-image": "",
      };
      labelPaint(l, p.inkFaint);
    },
    "state-label": (l) => {
      l.filter = and(l.filter, CA);
      l.minzoom = 2.5;
      l.maxzoom = 8;
      l.layout = {
        ...l.layout,
        "text-font": MAP_FONTS.political,
        "text-transform": "uppercase",
        "text-letter-spacing": 0.2,
        "text-size": ["interpolate", ["linear"], ["zoom"], 3, 9.5, 5, 11.5, 8, 14],
        "text-max-width": 8,
        // Short forms at national zoom (B.C., N.L.); names once there's room.
        "text-field": ["step", ["zoom"], ["coalesce", ["get", "abbr"], ["get", "name_en"], ["get", "name"]], 4, ["coalesce", ["get", "name_en"], ["get", "name"]]],
      };
      labelPaint(l, p.inkDim);
      l.paint = { ...l.paint, "text-opacity": 1 };
    },
    "settlement-major-label": (l) => {
      l.filter = and(relaxFilterrank(l.filter), CA, ["any", [">=", ["zoom"], 5], ["!", IN_ARCTIC], IS_CAPITAL] as FilterSpecification);
      l.layout = {
        ...l.layout,
        ...BESIDE_SYMBOLS,
        "text-anchor": undefined, // superseded by text-variable-anchor; dropped below
        "text-font": ["case", IS_CAPITAL, ["literal", MAP_FONTS.name], ["literal", MAP_FONTS.nameRegular]],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          3,
          ["step", ["get", "symbolrank"], 12, 6, 10.5],
          6,
          ["step", ["get", "symbolrank"], 15, 6, 13.5, 7, 12.5],
          10,
          ["step", ["get", "symbolrank"], 18, 9, 15, 10, 14],
          15,
          ["step", ["get", "symbolrank"], 22, 9, 18, 12, 15],
        ],
      };
      labelPaint(l, p.ink);
    },
    "settlement-minor-label": (l) => {
      l.filter = and(relaxFilterrank(l.filter), CA, ["any", [">=", ["zoom"], 5], ["!", IN_ARCTIC], IS_CAPITAL] as FilterSpecification);
      l.layout = {
        ...l.layout,
        ...BESIDE_SYMBOLS,
        "text-anchor": undefined, // superseded by text-variable-anchor; dropped below
        "text-font": MAP_FONTS.nameRegular,
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          3,
          10,
          6,
          ["step", ["get", "symbolrank"], 12.5, 9, 11.5],
          10,
          ["step", ["get", "symbolrank"], 14, 12, 12],
          13,
          ["step", ["get", "symbolrank"], 18, 12, 15, 15, 13],
        ],
      };
      labelPaint(l, p.inkDim);
    },
    "settlement-subdivision-label": (l) => {
      l.filter = and(l.filter, CA);
      l.layout = {
        ...l.layout,
        "text-font": MAP_FONTS.ui,
        "text-transform": "none",
        "text-letter-spacing": 0.02,
        "text-size": ["interpolate", ["linear"], ["zoom"], 11, 11, 15, 13.5],
      };
      labelPaint(l, p.inkFaint);
    },
    "water-point-label": (l) => {
      l.filter = and(
        l.filter,
        ["any", ["!", ["has", "iso_3166_1"]], TOUCHES_CA] as FilterSpecification,
        // Arctic thinning: at national zoom only the oceans, seas and the
        // largest bays (Hudson, Baffin, James) are named.
        ["any", [">=", ["zoom"], 5], ["!", IN_ARCTIC], ["<=", ["get", "sizerank"], 2]] as FilterSpecification,
      );
      l.layout = {
        ...l.layout,
        "text-font": MAP_FONTS.italic,
        "text-letter-spacing": ["match", ["get", "class"], "ocean", 0.3, ["bay", "sea"], 0.12, 0.02],
      };
      labelPaint(l, p.waterLabel);
    },
    "water-line-label": (l) => {
      l.filter = and(
        l.filter,
        ["any", ["!", ["has", "iso_3166_1"]], TOUCHES_CA] as FilterSpecification,
        ["any", [">=", ["zoom"], 5], ["!", IN_ARCTIC], ["<=", ["get", "sizerank"], 2]] as FilterSpecification,
      );
      l.layout = {
        ...l.layout,
        "text-font": MAP_FONTS.italic,
        "text-letter-spacing": ["match", ["get", "class"], "ocean", 0.3, ["bay", "sea"], 0.12, 0.02],
      };
      labelPaint(l, p.waterLabel);
    },
    "waterway-label": (l) => {
      l.filter = and(l.filter, ["any", ["!", ["has", "iso_3166_1"]], TOUCHES_CA] as FilterSpecification);
      l.layout = { ...l.layout, "text-font": MAP_FONTS.italic };
      labelPaint(l, p.waterLabel);
    },
    "natural-line-label": (l) => {
      l.filter = and(l.filter, CA);
      l.layout = { ...l.layout, "text-font": MAP_FONTS.italic };
      labelPaint(l, p.inkFaint);
    },
    "natural-point-label": (l) => {
      l.filter = and(l.filter, CA, ["any", [">=", ["zoom"], 6], ["!", IN_ARCTIC]] as FilterSpecification);
      l.layout = { ...l.layout, "text-font": MAP_FONTS.italic, "icon-image": "" };
      labelPaint(l, p.inkFaint);
    },
    // Points of interest: only parks survive, in the marginal italic and moss.
    // A store map shouldn't name every café and pharmacy around a store.
    "poi-label": (l) => {
      l.filter = and(l.filter, CA, ["==", ["get", "class"], "park_like"]);
      l.minzoom = 12;
      l.layout = { ...l.layout, "text-font": MAP_FONTS.italic, "icon-image": "", "text-size": 12.5 };
      labelPaint(l, p.parkLabel);
    },
    "road-label-simple": (l) => {
      l.filter = and(l.filter, CA);
      l.layout = { ...l.layout, "text-font": MAP_FONTS.ui, "text-letter-spacing": 0.02 };
      labelPaint(l, p.inkFaint);
    },
    "airport-label": hide,
    "continent-label": hide,
  };
}

export interface AtlasStyleExtras {
  /** Sources the page adds (the stores, a located point). */
  sources?: Record<string, SourceSpecification>;
  /** Layers drawn above the basemap, labels included. */
  layers?: LayerSpecification[];
  /**
   * How long paint changes take when the style is diffed in, i.e. a theme
   * switch (DESIGN.md, Motion). 0 snaps. Mapbox's own default is 300ms.
   */
  paintTransitionMs?: number;
}

/**
 * The atlas style for one theme: the base style with every layer recoloured
 * from the palette, labels filtered to Canada, the Arctic thinned, the conic
 * projection set, Canada drawn as the plate's paper and land outside it
 * faded.
 */
export function buildAtlasStyle(
  base: StyleSpecification,
  palette: MapPalette,
  boundary: AtlasBoundary,
  extras: AtlasStyleExtras = {},
): StyleSpecification {
  const edits = layerEdits(palette);
  const layers: LayerSpecification[] = [];

  for (const original of base.layers) {
    // The boundary fills sit under the water, so the simplified coastline
    // never shows; only the land border with the US needs to be exact. Roads,
    // buildings and labels outside Canada are handled per feature, by
    // iso_3166_1.
    if (original.id === "waterway") {
      // Fade landuse and parks outside Canada.
      layers.push({
        id: "atlas-outside-fade",
        type: "fill",
        source: "atlas-outside",
        paint: { "fill-color": palette.neighbour, "fill-opacity": 0.88, "fill-antialias": false },
      });
    }
    const layer = structuredClone(original) as Layer;
    edits[layer.id]?.(layer);
    for (const key of ["layout", "paint"] as const) {
      const props = layer[key];
      if (props) for (const k of Object.keys(props)) if (props[k] === undefined) delete props[k];
    }
    layers.push(layer);
    if (original.type === "background") {
      layers.push(
        {
          id: "atlas-outside",
          type: "fill",
          source: "atlas-outside",
          paint: { "fill-color": palette.neighbour, "fill-antialias": false },
        },
        {
          id: "atlas-canada",
          type: "fill",
          source: "atlas-canada",
          paint: { "fill-color": palette.land, "fill-antialias": false },
        },
      );
    }
  }

  const style: StyleSpecification = {
    ...base,
    projection: ATLAS_PROJECTION,
    sources: {
      ...base.sources,
      "atlas-canada": { type: "geojson", data: boundary.canada, buffer: 4 },
      "atlas-outside": { type: "geojson", data: boundary.outside, buffer: 4 },
      ...extras.sources,
    },
    layers: [...layers, ...(extras.layers ?? [])],
    transition: { duration: extras.paintTransitionMs ?? 0, delay: 0 },
  };
  // Atmosphere belongs to the globe; a printed plate has none.
  delete style.fog;
  return style;
}
