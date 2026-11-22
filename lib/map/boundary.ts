import { CANADA_BOUNDARY_URL } from "@/lib/map";

/**
 * Canada's outline for the atlas's land fills (public/map/canada.geojson,
 * from Natural Earth 1:10m). It's simplified and pushed out to sea along the
 * coasts, because it's drawn under the water layer: only the land border with
 * the United States has to be exact, and it's set back about 400 m toward the
 * US so imprecision never fades Canadian land.
 */

export interface AtlasBoundary {
  canada: GeoJSON.FeatureCollection<GeoJSON.MultiPolygon>;
  /** The world minus Canada: land outside Canada, faded by the style. */
  outside: GeoJSON.FeatureCollection<GeoJSON.MultiPolygon>;
}

/**
 * The land outside Canada only needs to cover what a plate of Canada can
 * show. It stops at 84°N: past Mercator's 85.05° limit, geometry explodes
 * when Mapbox reprojects it to the conic. North of it the water-coloured
 * background shows, so the polar cap reads as the Arctic Ocean.
 */
const [WEST, SOUTH, EAST, NORTH] = [-179, 20, -10, 84];

type Ring = GeoJSON.Position[];

/** True if the ring runs clockwise in lng/lat (y up). */
function isClockwise(ring: Ring): boolean {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    sum += (ring[i + 1][0] - ring[i][0]) * (ring[i + 1][1] + ring[i][1]);
  }
  return sum > 0;
}

function wind(ring: Ring, clockwise: boolean): Ring {
  return isClockwise(ring) === clockwise ? ring : [...ring].reverse();
}

function segmentsCross(a: GeoJSON.Position, b: GeoJSON.Position, c: GeoJSON.Position, d: GeoJSON.Position) {
  const o = (p: GeoJSON.Position, q: GeoJSON.Position, r: GeoJSON.Position) =>
    Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
}

/** A slit from a piece of Canada to the world ring's edge. */
interface Slit {
  piece: Ring;
  /** Index of the piece's vertex the slit leaves from. */
  at: number;
  /** Where it meets the world ring. */
  edge: GeoJSON.Position;
  /** Which side of the world ring: 0 south, 1 east, 2 north, 3 west (the ring's order). */
  side: number;
}

/**
 * The first clear way out of `piece`: south, north, west or east from its
 * extreme vertex. The build joins boxed-in islands to the mainland, so every
 * piece in the shipped file has one; if a future file doesn't, the piece is
 * left out of the mask (faded) rather than cut by a slit through Canada.
 */
function slitFor(piece: Ring, others: Ring[], taken: Slit[]): Slit | null {
  const extreme = (score: (p: GeoJSON.Position) => number) =>
    piece.reduce((best, p, i) => (score(p) < score(piece[best]) ? i : best), 0);
  const candidates: Slit[] = [
    { at: extreme((p) => p[1]), side: 0 },
    { at: extreme((p) => -p[1]), side: 2 },
    { at: extreme((p) => p[0]), side: 3 },
    { at: extreme((p) => -p[0]), side: 1 },
  ].map(({ at, side }) => {
    const [x, y] = piece[at];
    const edge = side === 0 ? [x, SOUTH] : side === 2 ? [x, NORTH] : side === 3 ? [WEST, y] : [EAST, y];
    return { piece, at, edge, side };
  });
  const clear = candidates.find((s) => {
    const from = piece[s.at];
    const crossesRing = (ring: Ring) => ring.some((p, i) => i > 0 && segmentsCross(from, s.edge, ring[i - 1], p));
    const crossesSlit = (t: Slit) => segmentsCross(from, s.edge, t.piece[t.at], t.edge);
    return !others.some(crossesRing) && !taken.some(crossesSlit);
  });
  return clear ?? null;
}

/**
 * The inverse of Canada by ring arithmetic, no geometry library, and with no
 * holes: each piece of Canada is joined to the world ring's edge by a
 * zero-width slit, so the whole mask is one ring. (Mapbox tells holes from
 * outer rings by winding, and under the conic projection that goes wrong in
 * the tiles north of 66.5°N: the Arctic filled in as "outside".) Each hole
 * inside a piece, a bit of the US the buffered outline surrounds (Point
 * Roberts, the Alaska panhandle's islands), becomes a polygon of its own.
 */
function invert(canada: GeoJSON.MultiPolygon): GeoJSON.MultiPolygon {
  // The world runs counter-clockwise; pieces are walked clockwise inside it.
  const pieces = canada.coordinates.map((poly) => wind(poly[0], true));
  const slits: Slit[] = [];
  for (const piece of pieces) {
    const slit = slitFor(piece, pieces.filter((p) => p !== piece), slits);
    if (slit) slits.push(slit);
    else console.warn("Canada boundary: a piece has no clear slit; it's left out of the mask.");
  }

  // Position along the counter-clockwise world ring: south edge west to east,
  // east edge south to north, north edge east to west, west edge north to south.
  const along = (s: Slit) =>
    s.side === 0 ? s.edge[0] : s.side === 1 ? s.edge[1] : s.side === 2 ? -s.edge[0] : -s.edge[1];
  const corners: Ring = [
    [WEST, SOUTH],
    [EAST, SOUTH],
    [EAST, NORTH],
    [WEST, NORTH],
  ];
  const ring: Ring = [];
  corners.forEach((corner, side) => {
    ring.push(corner);
    for (const s of slits.filter((t) => t.side === side).sort((a, b) => along(a) - along(b))) {
      const n = s.piece.length - 1; // closed ring: last point repeats the first
      const walk = Array.from({ length: n + 1 }, (_, k) => s.piece[(s.at + k) % n]);
      ring.push(s.edge, ...walk, s.edge);
    }
  });
  ring.push(corners[0]);

  const islands = canada.coordinates.flatMap((poly) => poly.slice(1).map((r) => [wind(r, false)]));
  return { type: "MultiPolygon", coordinates: [[ring], ...islands] };
}

let boundary: Promise<AtlasBoundary> | null = null;

export function loadBoundary(): Promise<AtlasBoundary> {
  boundary ??= fetch(CANADA_BOUNDARY_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`Canada boundary: ${r.status}`);
      return r.json() as Promise<GeoJSON.FeatureCollection<GeoJSON.MultiPolygon>>;
    })
    .then((canada) => ({
      canada,
      outside: {
        type: "FeatureCollection",
        features: [{ type: "Feature", properties: {}, geometry: invert(canada.features[0].geometry) }],
      },
    }));
  boundary.catch(() => {
    boundary = null;
  });
  return boundary;
}
