import type { ProjectionSpecification } from "mapbox-gl";

/**
 * The Mapbox styles the atlas styles are built from. They're rewritten at
 * runtime from the design tokens before the first frame (lib/map/style.ts),
 * so nothing here is shown as Mapbox ships it.
 */
export const BASE_STYLES = {
  dark: "mapbox/dark-v11",
  light: "mapbox/light-v11",
} as const;

/**
 * Atlas of Canada Lambert (EPSG:3978): Lambert Conformal Conic with standard
 * parallels 49°N and 77°N, centred on 95°W. Mapbox adapts the projection
 * toward the view as you zoom in, so city zooms stay north-up and unsheared.
 */
export const ATLAS_PROJECTION: ProjectionSpecification = {
  name: "lambertConformalConic",
  center: [-95, 49],
  parallels: [49, 77],
};

/**
 * The national view. Mapbox's fitBounds doesn't frame a conic projection
 * well (it centres near 62°W), so the plate is framed by hand: this centre
 * puts Canada's mainland mid-plate, and the zoom fits Yukon to Newfoundland
 * across a 1000px-wide map, scaled for other sizes.
 */
const NATIONAL_CENTER: [number, number] = [-96, 61.5];
const NATIONAL_ZOOM_AT_1000 = 2.95;
const NATIONAL_ASPECT = 0.82; // Canada's height over width on the plate

export function nationalCamera(width: number, height: number) {
  const fit = Math.min(width / 1000, height / (1000 * NATIONAL_ASPECT));
  return { center: NATIONAL_CENTER, zoom: NATIONAL_ZOOM_AT_1000 + Math.log2(fit) };
}

/** Canada's outline for the land fills and the inverse mask (lib/map/boundary.ts). */
export const CANADA_BOUNDARY_URL = "/map/canada.geojson";

/** Hosted Mapbox font stacks standing in for the locked families (DESIGN.md, Type). */
export const MAP_FONTS = {
  /** Playfair Display is hosted, so names use the real family. */
  name: ["Playfair Display Bold", "Arial Unicode MS Regular"],
  nameRegular: ["Playfair Display Regular", "Arial Unicode MS Regular"],
  /** The marginal voice: water, parks and landforms. */
  italic: ["Playfair Display Italic", "Arial Unicode MS Regular"],
  /** Jost isn't hosted; Poppins is the nearest hosted geometric sans. */
  political: ["Poppins Medium", "Arial Unicode MS Regular"],
  ui: ["Poppins Regular", "Arial Unicode MS Regular"],
  /** IBM Plex Mono isn't hosted; Source Code Pro stands in for figures. */
  figures: ["Source Code Pro Medium", "Arial Unicode MS Regular"],
} as const;
