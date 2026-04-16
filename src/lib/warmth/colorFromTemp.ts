/** Bounds used for map fill color and legend (°C). */
export const WARMTH_SCALE_MIN_C = -30;
export const WARMTH_SCALE_MAX_C = 45;

/**
 * Maps air temperature (°C) to a semi-transparent hex fill for map highlights.
 * Cold: blues → Hot: reds (piecewise linear on hue, fixed saturation/lightness).
 */
export function colorFromTempCelsius(tempC: number): string {
  const t = Math.max(WARMTH_SCALE_MIN_C, Math.min(WARMTH_SCALE_MAX_C, tempC));
  // Normalize 0..1 across -30..45 °C
  const u = (t + 30) / 75;

  // Hue: 240 (blue) → 0 (red)
  const hue = 240 * (1 - u);
  // Slightly higher saturation in the middle for a "juicier" look
  const sat = 75 + Math.sin(u * Math.PI) * 15;
  const light = 52 - Math.abs(u - 0.5) * 10;

  return `hsla(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%, 0.55)`;
}

/**
 * Stronger outline color derived from the same temperature (opaque).
 */
export function outlineColorFromTempCelsius(tempC: number): string {
  const t = Math.max(WARMTH_SCALE_MIN_C, Math.min(WARMTH_SCALE_MAX_C, tempC));
  const u = (t + 30) / 75;
  const hue = 240 * (1 - u);
  const sat = 80 + Math.sin(u * Math.PI) * 10;
  const light = 65;
  return `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%)`;
}

/** Display conversion. */
export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export type TemperatureDisplayUnit = "C" | "F";

/** Formats °C using the chosen display unit (`decimals` default 1 for list readouts). */
export function formatTemperature(
  tempC: number,
  unit: TemperatureDisplayUnit,
  decimals = 1,
): string {
  if (unit === "C") return `${tempC.toFixed(decimals)}°C`;
  return `${celsiusToFahrenheit(tempC).toFixed(decimals)}°F`;
}

/**
 * CSS `linear-gradient` matching the outline warmth palette (opaque), cold at bottom → hot at top.
 */
export function warmthLegendGradientCss(direction: "to top" | "to bottom" = "to top"): string {
  const steps = 40;
  const stops: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t =
      WARMTH_SCALE_MIN_C +
      (WARMTH_SCALE_MAX_C - WARMTH_SCALE_MIN_C) * (i / steps);
    const color = outlineColorFromTempCelsius(t);
    const pct = (i / steps) * 100;
    stops.push(`${color} ${pct}%`);
  }
  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}
