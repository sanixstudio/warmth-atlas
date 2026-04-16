import { describe, expect, it } from "vitest";

import { iso2ToRegionalFlagEmoji, mapLabelWithFlagEmoji } from "./place-flag";

describe("iso2ToRegionalFlagEmoji", () => {
  it("returns flag emoji for Japan", () => {
    expect(iso2ToRegionalFlagEmoji("JP")).toBe("🇯🇵");
  });

  it("returns empty for invalid codes", () => {
    expect(iso2ToRegionalFlagEmoji("")).toBe("");
    expect(iso2ToRegionalFlagEmoji("1A")).toBe("");
  });
});

describe("mapLabelWithFlagEmoji", () => {
  it("builds two-line label for country", () => {
    const s = mapLabelWithFlagEmoji(
      {
        id: "DE",
        kind: "country",
        iso2: "DE",
        iso3: "DEU",
        name: "Germany",
        capital: "Berlin",
        lat: 0,
        lon: 0,
        tempC: 10,
        observedAt: null,
        warmthFill: "#000",
        warmthOutline: "#000",
      },
      "10°C",
    );
    expect(s.endsWith("10°C")).toBe(true);
    expect(s).toContain("\n");
    expect(s.startsWith(iso2ToRegionalFlagEmoji("DE"))).toBe(true);
  });
});
