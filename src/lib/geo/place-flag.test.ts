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

  it("uses country flag emoji for a city row (iso2)", () => {
    const s = mapLabelWithFlagEmoji(
      {
        id: "city-5391959",
        kind: "city",
        iso2: "US",
        iso3: "USA",
        name: "San Francisco",
        capital: "CA · US",
        lat: 37.77,
        lon: -122.42,
        tempC: 15,
        observedAt: null,
        warmthFill: "#000",
        warmthOutline: "#000",
      },
      "59°F",
    );
    expect(s.endsWith("59°F")).toBe(true);
    expect(s.startsWith(iso2ToRegionalFlagEmoji("US"))).toBe(true);
  });
});
