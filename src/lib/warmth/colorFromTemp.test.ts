import { describe, expect, it } from "vitest";

import {
  celsiusToFahrenheit,
  colorFromTempCelsius,
  formatTemperature,
  outlineColorFromTempCelsius,
  warmthLegendGradientCss,
} from "./colorFromTemp";

describe("colorFromTempCelsius", () => {
  it("returns hsla strings for cold and hot", () => {
    const cold = colorFromTempCelsius(-20);
    const hot = colorFromTempCelsius(40);
    expect(cold).toMatch(/^hsla\(/);
    expect(hot).toMatch(/^hsla\(/);
    expect(cold).not.toBe(hot);
  });

  it("clamps extreme temperatures", () => {
    expect(() => colorFromTempCelsius(-100)).not.toThrow();
    expect(() => colorFromTempCelsius(100)).not.toThrow();
  });
});

describe("outlineColorFromTempCelsius", () => {
  it("returns opaque hsl", () => {
    expect(outlineColorFromTempCelsius(10)).toMatch(/^hsl\(/);
  });
});

describe("celsiusToFahrenheit", () => {
  it("converts water freeze and boil", () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
  });
});

describe("formatTemperature", () => {
  it("respects unit and decimals", () => {
    expect(formatTemperature(12.3, "C", 1)).toBe("12.3°C");
    expect(formatTemperature(0, "F", 0)).toBe("32°F");
  });
});

describe("warmthLegendGradientCss", () => {
  it("returns a linear-gradient string", () => {
    const g = warmthLegendGradientCss("to top");
    expect(g).toMatch(/^linear-gradient\(to top,/);
  });
});
