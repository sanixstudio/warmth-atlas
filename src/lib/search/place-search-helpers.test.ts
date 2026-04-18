import { describe, expect, it } from "vitest";

import { placeNamesEqual, placeSearchResultListSubtitle } from "./place-search-helpers";
import type { PlaceSearchResult } from "@/lib/schemas/place";

describe("placeNamesEqual", () => {
  it("compares normalized labels", () => {
    expect(placeNamesEqual("India", "  india ")).toBe(true);
    expect(placeNamesEqual("India", "Indiana")).toBe(false);
  });
});

describe("placeSearchResultListSubtitle", () => {
  it("formats country, state, and city lines", () => {
    const country: PlaceSearchResult = {
      kind: "country",
      id: "JP",
      name: "Japan",
      capital: "Tokyo",
      lat: 0,
      lon: 0,
      iso2: "JP",
      iso3: "JPN",
    };
    expect(placeSearchResultListSubtitle(country)).toBe("JP · Tokyo");

    const state: PlaceSearchResult = {
      kind: "us_state",
      id: "US-TX",
      name: "Texas",
      capital: "Natural Earth reference",
      lat: 0,
      lon: 0,
      iso2: "TX",
      iso3: "USA",
    };
    expect(placeSearchResultListSubtitle(state)).toBe("U.S. state · US-TX");

    const city: PlaceSearchResult = {
      kind: "city",
      id: "city-1",
      name: "Austin",
      capital: "TX · US",
      lat: 0,
      lon: 0,
      iso2: "US",
      iso3: "USA",
    };
    expect(placeSearchResultListSubtitle(city)).toBe("TX · US");
  });
});
