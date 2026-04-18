/**
 * How warmth is drawn on the globe and summarized in the legend.
 * - `standard` — Color fill is the main cue (default).
 * - `accessible` — Lighter fill + high-contrast outline halo + dashed border + larger labels; legend adds stripe texture.
 */
export type WarmthDisplayMode = "standard" | "accessible";

export function isAccessibleWarmthMode(mode: WarmthDisplayMode): boolean {
  return mode === "accessible";
}
