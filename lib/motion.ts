/**
 * Motion settings read at runtime, for the code that animates outside CSS
 * (the Mapbox camera and paint transitions). The durations are the CSS
 * tokens in app/globals.css, so density and reduced motion apply here too.
 * DESIGN.md, Motion, defines the four transitions these serve.
 */

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** A `--dur-*` token in milliseconds (0 with reduced motion or if unset). */
export function motionMs(token: "--dur-quick" | "--dur-move" | "--dur-camera"): number {
  if (typeof window === "undefined" || prefersReducedMotion()) return 0;
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const ms = value.endsWith("ms") ? parseFloat(value) : value.endsWith("s") ? parseFloat(value) * 1000 : NaN;
  return Number.isFinite(ms) ? ms : 0;
}
