import { describe, expect, it } from "vitest";

import { parseRestCountriesArray } from "./country";

describe("parseRestCountriesArray", () => {
  it("normalizes a valid REST Countries payload", () => {
    const raw = [
      {
        cca2: "jp",
        cca3: "JPN",
        name: { common: "Japan" },
        capital: ["Tokyo"],
        capitalInfo: { latlng: [35.68, 139.76] },
        latlng: [36, 138],
      },
    ];
    const results = parseRestCountriesArray(raw);
    expect(results).toHaveLength(1);
    expect(results[0]?.kind).toBe("country");
    expect(results[0]?.id).toBe("JP");
    expect(results[0]?.iso2).toBe("JP");
    expect(results[0]?.lat).toBeCloseTo(35.68);
  });

  it("falls back to country latlng when capitalInfo is missing", () => {
    const raw = [
      {
        cca2: "xx",
        cca3: "XXX",
        name: { common: "Test" },
        latlng: [10, 20],
      },
    ];
    const results = parseRestCountriesArray(raw);
    expect(results[0]?.lat).toBe(10);
    expect(results[0]?.lon).toBe(20);
  });
});
