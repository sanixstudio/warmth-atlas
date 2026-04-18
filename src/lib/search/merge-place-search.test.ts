import { describe, expect, it } from "vitest";

import { mergeCountriesStatesAndCities, normalizePlaceLabel } from "./merge-place-search";
import type { PlaceSearchResult } from "@/lib/schemas/place";

const countryFrance: PlaceSearchResult = {
  kind: "country",
  id: "FR",
  name: "France",
  capital: "Paris",
  lat: 46,
  lon: 2,
  iso2: "FR",
  iso3: "FRA",
};

const cityParis: PlaceSearchResult = {
  kind: "city",
  id: "city-2988507",
  name: "Paris",
   capital: "Paris · France",
  lat: 48.85,
  lon: 2.35,
  iso2: "FR",
  iso3: "FRA",
};

const cityLyon: PlaceSearchResult = {
  kind: "city",
  id: "city-2996944",
  name: "Lyon",
  capital: "Rhône · France",
  lat: 45.76,
  lon: 4.84,
  iso2: "FR",
  iso3: "FRA",
};

const stateNy: PlaceSearchResult = {
  kind: "us_state",
  id: "US-NY",
  name: "New York",
  capital: "Natural Earth reference",
  lat: 43,
  lon: -75.5,
  iso2: "NY",
  iso3: "USA",
};

const cityNyc: PlaceSearchResult = {
  kind: "city",
  id: "city-5128581",
  name: "New York",
  capital: "NY · US",
  lat: 40.71,
  lon: -74.01,
  iso2: "US",
  iso3: "USA",
};

describe("normalizePlaceLabel", () => {
  it("trims and lowercases", () => {
    expect(normalizePlaceLabel("  New York  ")).toBe("new york");
  });
});

describe("mergeCountriesStatesAndCities", () => {
  it("returns only cities when there are no countries or states", () => {
    const sf: PlaceSearchResult = {
      kind: "city",
      id: "city-5391959",
      name: "San Francisco",
      capital: "CA · US",
      lat: 37.77,
      lon: -122.42,
      iso2: "US",
      iso3: "USA",
    };
    const out = mergeCountriesStatesAndCities([], [], [sf]);
    expect(out).toEqual([sf]);
  });

  it("drops unrelated cities when countries match", () => {
    const out = mergeCountriesStatesAndCities([countryFrance], [], [cityParis, cityLyon]);
    expect(out).toEqual([countryFrance]);
  });

  it("does not append cities when a country matched (city/country same name is ranked client-side)", () => {
    const monacoCountry: PlaceSearchResult = {
      kind: "country",
      id: "MC",
      name: "Monaco",
      capital: "Monaco",
      lat: 43.73,
      lon: 7.42,
      iso2: "MC",
      iso3: "MCO",
    };
    const monacoCity: PlaceSearchResult = {
      kind: "city",
      id: "city-2993458",
      name: "Monaco",
      capital: "Monaco",
      lat: 43.73,
      lon: 7.42,
      iso2: "MC",
      iso3: "MCO",
    };
    const out = mergeCountriesStatesAndCities([monacoCountry], [], [monacoCity, cityLyon]);
    expect(out).toEqual([monacoCountry]);
  });

  it("includes a city whose name matches a matched state (homonym)", () => {
    const out = mergeCountriesStatesAndCities([], [stateNy], [cityNyc, cityParis]);
    expect(out.map((p) => p.id)).toEqual([stateNy.id, cityNyc.id]);
  });
});
