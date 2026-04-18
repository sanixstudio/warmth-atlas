import { describe, expect, it } from "vitest";

import { normalizePlaceLabel } from "./merge-place-search";
import { placeNameMatchScore, rankSearchResults } from "./rank-place-search";
import type { PlaceSearchResult } from "@/lib/schemas/place";

const indiaCountry: PlaceSearchResult = {
  kind: "country",
  id: "IN",
  name: "India",
  capital: "New Delhi",
  lat: 20,
  lon: 77,
  iso2: "IN",
  iso3: "IND",
};

const indianaState: PlaceSearchResult = {
  kind: "us_state",
  id: "US-IN",
  name: "Indiana",
  capital: "Natural Earth reference",
  lat: 40,
  lon: -86,
  iso2: "IN",
  iso3: "USA",
};

const biot: PlaceSearchResult = {
  kind: "country",
  id: "IO",
  name: "British Indian Ocean Territory",
  capital: "Diego Garcia",
  lat: -6,
  lon: 72,
  iso2: "IO",
  iso3: "IOT",
};

describe("placeNameMatchScore", () => {
  it("scores exact highest", () => {
    const qn = normalizePlaceLabel("india");
    expect(placeNameMatchScore(qn, indiaCountry)).toBeGreaterThan(placeNameMatchScore(qn, indianaState));
  });
});

describe("rankSearchResults", () => {
  it("for india keeps only exact name matches (country vs Indiana vs territory)", () => {
    const merged = [indiaCountry, indianaState, biot];
    const out = rankSearchResults("india", merged, 12);
    expect(out.every((p) => normalizePlaceLabel(p.name) === "india")).toBe(true);
    expect(out.map((p) => p.id)).toEqual([indiaCountry.id]);
  });

  it("without exact uses scored prefix and substring", () => {
    const out = rankSearchResults("indi", [indianaState, indiaCountry], 5);
    expect(out.length).toBeGreaterThan(0);
    expect(out[0].name).toBe("India");
  });

  it("caps many geocoder rows that share the same city name", () => {
    const rows: PlaceSearchResult[] = Array.from({ length: 12 }, (_, i) => ({
      kind: "city" as const,
      id: `city-dup-${i}`,
      name: "India",
      capital: `Place ${i}`,
      lat: 0,
      lon: 0,
      iso2: "US",
      iso3: "USA",
    }));
    const out = rankSearchResults("india", rows, 20);
    expect(out.length).toBe(6);
    expect(out.every((p) => p.name === "India")).toBe(true);
  });

  it("respects max", () => {
    const many: PlaceSearchResult[] = Array.from({ length: 20 }, (_, i) => ({
      kind: "city" as const,
      id: `city-x-${i}`,
      name: `Testville ${i}`,
      capital: "Somewhere",
      lat: 0,
      lon: 0,
      iso2: "US",
      iso3: "USA",
    }));
    const out = rankSearchResults("testville", many, 5);
    expect(out.length).toBe(5);
  });
});
