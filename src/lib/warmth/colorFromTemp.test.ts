import { describe, expect, it } from "vitest";

import { celsiusToFahrenheit, colorFromTempCelsius, outlineColorFromTempCelsius } from "./colorFromTemp";

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
