import type { PlaceSearchResult } from "@/lib/schemas/place";

/**
 * Normalizes a place or query string for case- and spacing-insensitive comparison.
 */
export function normalizePlaceLabel(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Merges REST country hits, bundled U.S. state hits, and geocoded cities.
 *
 * - If **any country** matched: return countries + states only (no cities). Same-name
 *   geocoded places are filtered later by {@link rankSearchResults} (exact match).
 * - If **only U.S. states** matched: append cities whose name equals a matched state
 *   (e.g. New York city vs New York state), capped to avoid noise.
 * - If neither matched: return geocoded cities only (pure city search).
 */
export function mergeCountriesStatesAndCities(
  countries: PlaceSearchResult[],
  states: PlaceSearchResult[],
  cities: PlaceSearchResult[],
): PlaceSearchResult[] {
  const hasCountry = countries.length > 0;
  if (hasCountry) {
    return [...countries, ...states];
  }

  if (states.length === 0) {
    return cities;
  }

  const homonymCities = cities
    .filter((c) =>
      states.some((s) => normalizePlaceLabel(s.name) === normalizePlaceLabel(c.name)),
    )
    .slice(0, 6);

  return [...states, ...homonymCities];
}
