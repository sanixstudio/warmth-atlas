/**
 * Maps air temperature (°C) to a semi-transparent hex fill for map highlights.
 * Cold: blues → Hot: reds (piecewise linear on hue, fixed saturation/lightness).
 */
export function colorFromTempCelsius(tempC: number): string {
  const t = Math.max(-30, Math.min(45, tempC));
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
  const t = Math.max(-30, Math.min(45, tempC));
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
