import type { Map as MapboxMap } from "mapbox-gl";

/**
 * The atlas's map symbols as signed distance fields (SDF), so one image
 * covers every colour state through `icon-color` and draws its own flat
 * halo through `icon-halo-*`. They're drawn here, at load, from the same
 * shapes as components/ui/icons.tsx: no sprite edits, no network.
 */

/** Image ids, registered once per style load. */
export const SYMBOL = {
  book: "atlas-book",
  disc: "atlas-disc",
  locator: "atlas-locator",
  ring: "atlas-ring",
} as const;

/** Logical (CSS px) sizes at `icon-size: 1`. */
export const SYMBOL_SIZE = {
  /** The open-book glyph's width. */
  book: 18,
  /** The cluster disc's diameter. */
  disc: 32,
  /** The locator's outer diameter, ticks included. */
  locator: 40,
  /** The hover ring's diameter. */
  ring: 30,
} as const;

const PIXEL_RATIO = 2;
/** SDF radius in image pixels; the halo can reach about 0.75 of it. */
const RADIUS = 8;
const CUTOFF = 0.25;
const INF = 1e20;

/** BookGlyph's path (icons.tsx), on its -8 -6 16 12 viewBox. */
const BOOK_PATH = "M-6 -3.2C-4 -4.6 -1.6 -4.4 0 -3C1.6 -4.4 4 -4.6 6 -3.2V3.6C4 2.4 1.6 2.6 0 3.8C-1.6 2.6 -4 2.4 -6 3.6Z";

// One-dimensional squared distance transform (Felzenszwalb and Huttenlocher),
// as in Mapbox's TinySDF.
function edt1d(grid: Float64Array, offset: number, stride: number, length: number, f: Float64Array, v: Uint16Array, z: Float64Array) {
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  f[0] = grid[offset];
  for (let q = 1, k = 0, s = 0; q < length; q++) {
    f[q] = grid[offset + q * stride];
    const q2 = q * q;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  for (let q = 0, k = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    const qr = q - r;
    grid[offset + q * stride] = f[r] + qr * qr;
  }
}

function edt(grid: Float64Array, width: number, height: number) {
  const n = Math.max(width, height);
  const f = new Float64Array(n);
  const v = new Uint16Array(n);
  const z = new Float64Array(n + 1);
  for (let x = 0; x < width; x++) edt1d(grid, x, width, height, f, v, z);
  for (let y = 0; y < height; y++) edt1d(grid, y * width, 1, width, f, v, z);
}

/** Rasterise a shape (drawn in logical px, origin at the centre) to an SDF image. */
function sdfImage(logicalW: number, logicalH: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const width = Math.ceil(logicalW * PIXEL_RATIO) + RADIUS * 2;
  const height = Math.ceil(logicalH * PIXEL_RATIO) + RADIUS * 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.translate(width / 2, height / 2);
  ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  draw(ctx);

  const src = ctx.getImageData(0, 0, width, height).data;
  const size = width * height;
  const outer = new Float64Array(size);
  const inner = new Float64Array(size);
  for (let i = 0; i < size; i++) {
    const a = src[i * 4 + 3] / 255;
    if (a === 1) {
      outer[i] = 0;
      inner[i] = INF;
    } else if (a === 0) {
      outer[i] = INF;
      inner[i] = 0;
    } else {
      const d = 0.5 - a;
      outer[i] = d > 0 ? d * d : 0;
      inner[i] = d < 0 ? d * d : 0;
    }
  }
  edt(outer, width, height);
  edt(inner, width, height);

  const data = new Uint8Array(size * 4);
  for (let i = 0; i < size; i++) {
    const d = Math.sqrt(outer[i]) - Math.sqrt(inner[i]);
    data[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(255 - 255 * (d / RADIUS + CUTOFF))));
  }
  return { width, height, data };
}

let cache: Record<string, ReturnType<typeof sdfImage>> | null = null;

function images() {
  if (cache) return cache;
  const book = sdfImage(SYMBOL_SIZE.book, SYMBOL_SIZE.book * 0.75, (ctx) => {
    const s = SYMBOL_SIZE.book / 13; // the glyph's path spans 12 units; keep a hair of margin
    ctx.scale(s, s);
    ctx.fill(new Path2D(BOOK_PATH));
  });
  const disc = sdfImage(SYMBOL_SIZE.disc, SYMBOL_SIZE.disc, (ctx) => {
    ctx.beginPath();
    ctx.arc(0, 0, SYMBOL_SIZE.disc / 2, 0, Math.PI * 2);
    ctx.fill();
  });
  // The locator: a hairline ring with four registration ticks, like the
  // crosshair a cartographer draws to fix a point.
  const locator = sdfImage(SYMBOL_SIZE.locator, SYMBOL_SIZE.locator, (ctx) => {
    const r = SYMBOL_SIZE.locator / 2 - 6;
    ctx.lineWidth = 1.75;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.75;
    ctx.lineCap = "butt";
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(dx * (r - 3.5), dy * (r - 3.5));
      ctx.lineTo(dx * (r + 6), dy * (r + 6));
      ctx.stroke();
    }
  });
  const ring = sdfImage(SYMBOL_SIZE.ring, SYMBOL_SIZE.ring, (ctx) => {
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, SYMBOL_SIZE.ring / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  });
  cache = { [SYMBOL.book]: book, [SYMBOL.disc]: disc, [SYMBOL.locator]: locator, [SYMBOL.ring]: ring };
  return cache;
}

/**
 * Add the atlas symbols to the map's current style, if they aren't there.
 * Call on `style.load`; a theme swap that diffs in place keeps them, and a
 * full reload drops them and triggers this again.
 */
export function registerSymbols(map: MapboxMap) {
  for (const [id, image] of Object.entries(images())) {
    if (!map.hasImage(id)) map.addImage(id, image, { pixelRatio: PIXEL_RATIO, sdf: true });
  }
}

/** For `styleimagemissing`: add an atlas symbol the style asked for before load finished. */
export function isAtlasSymbol(id: string) {
  return (Object.values(SYMBOL) as string[]).includes(id);
}
