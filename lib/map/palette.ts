/**
 * The map's colours, read from the design tokens in app/globals.css so the
 * basemap and the chrome share one palette (BRIEF 2.1). Every colour here is
 * a token, or a mix of two tokens: no new hues.
 *
 * Mapbox paint properties don't accept `color-mix()` or `var()`, so the mixes
 * are computed here, from the computed values of the tokens for the theme the
 * document has right now.
 */

export type MapTheme = "light" | "dark";

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseColor(value: string): Rgba {
  const v = value.trim();
  if (v.startsWith("#")) {
    const hex = v.length === 4 ? [...v.slice(1)].map((c) => c + c).join("") : v.slice(1, 7);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  }
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b, a = "1"] = m[1].split(/[\s,/]+/).filter(Boolean);
    return { r: Number(r), g: Number(g), b: Number(b), a: Number(a) };
  }
  throw new Error(`Unreadable colour token: ${value}`);
}

function toCss({ r, g, b, a }: Rgba): string {
  const c = (n: number) => Math.round(n);
  return a >= 1 ? `rgb(${c(r)}, ${c(g)}, ${c(b)})` : `rgba(${c(r)}, ${c(g)}, ${c(b)}, ${+a.toFixed(3)})`;
}

/** `color-mix(in srgb, a, b t)`: t of b over a. */
function mix(a: string, b: string, t: number): string {
  const x = parseColor(a);
  const y = parseColor(b);
  return toCss({
    r: x.r + (y.r - x.r) * t,
    g: x.g + (y.g - x.g) * t,
    b: x.b + (y.b - x.b) * t,
    a: 1,
  });
}

/** A token at an alpha. */
export function alpha(color: string, a: number): string {
  return toCss({ ...parseColor(color), a });
}

export interface MapPalette {
  theme: MapTheme;
  /** Canada's land: the plate's paper. */
  land: string;
  /** Land outside Canada, laid over it by the mask. */
  neighbour: string;
  water: string;
  waterLabel: string;
  park: string;
  parkLabel: string;
  building: string;
  road: string;
  roadMajor: string;
  /** Roads outside Canada, receding with the mask. */
  roadAbroad: string;
  boundary: string;
  provinceBoundary: string;
  /** Halo behind every label: the land it sits on. */
  halo: string;
  ink: string;
  inkDim: string;
  inkFaint: string;
  moss: string;
  mossDeep: string;
  amber: string;
  /** The ground the map's symbols are cut out of (their halo). */
  ground: string;
}

/** The tokens as the document has them now. Call after the theme class flips. */
export function readMapPalette(theme: MapTheme): MapPalette {
  const css = getComputedStyle(document.documentElement);
  const t = (name: string) => css.getPropertyValue(name).trim();

  const bg = t("--bg");
  const raised = t("--bg-raised");
  const step = t("--bg-step");
  const ink = t("--ink");
  const inkDim = t("--ink-dim");
  const inkFaint = t("--ink-faint");
  const moss = t("--moss");
  const mossDeep = t("--moss-deep");
  const amber = t("--amber");
  const info = t("--info");

  const dark = theme === "dark";
  // Light: Canada is the paper (bg-raised), its neighbours a step down.
  // Dark: Canada lifts a tone above bg-raised; its neighbours and the sea sink.
  const land = dark ? mix(raised, ink, 0.05) : raised;
  const neighbour = dark ? mix(bg, raised, 0.4) : step;

  return {
    theme,
    land,
    neighbour,
    water: dark ? mix(bg, info, 0.075) : mix(step, info, 0.2),
    waterLabel: dark ? mix(inkFaint, info, 0.45) : mix(inkDim, info, 0.55),
    park: mix(land, moss, dark ? 0.1 : 0.12),
    parkLabel: moss,
    building: mix(land, ink, dark ? 0.07 : 0.06),
    road: mix(land, ink, dark ? 0.14 : 0.13),
    roadMajor: mix(land, ink, dark ? 0.24 : 0.22),
    roadAbroad: mix(neighbour, ink, dark ? 0.08 : 0.08),
    boundary: inkFaint,
    provinceBoundary: alpha(inkFaint, 0.8),
    halo: land,
    ink,
    inkDim,
    inkFaint,
    moss,
    mossDeep,
    amber,
    ground: land,
  };
}
