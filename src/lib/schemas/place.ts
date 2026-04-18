import { z } from "zod";

/**
 * Normalized search hit: country (REST Countries), U.S. state (bundled NE metadata), or city (Open-Meteo geocoding).
 */
export const placeSearchResultSchema = z.object({
  kind: z.enum(["country", "us_state", "city"]),
  /** Stable id: ISO2 for countries, `US-XX` for states, `city-{geocodeId}` for cities. */
  id: z.string().min(2).max(40),
  name: z.string(),
  /** Secondary line in UI: capital name, or a fixed phrase for states. */
  capital: z.string(),
  lat: z.number(),
  lon: z.number(),
  /** ISO2 country code, or two-letter state postal for `us_state`. */
  iso2: z.string().length(2),
  /** ISO3 for countries; `USA` for U.S. states. */
  iso3: z.string().length(3),
});

export type PlaceSearchResult = z.infer<typeof placeSearchResultSchema>;

export const placeSearchResponseSchema = z.object({
  results: z.array(placeSearchResultSchema),
});

export type PlaceSearchResponse = z.infer<typeof placeSearchResponseSchema>;
