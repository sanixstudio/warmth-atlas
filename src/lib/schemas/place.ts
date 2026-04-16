import { z } from "zod";

/**
 * Normalized search hit: sovereign country (REST Countries) or U.S. state (Natural Earth metadata).
 */
export const placeSearchResultSchema = z.object({
  kind: z.enum(["country", "us_state"]),
  /** Stable id: ISO2 for countries (`DE`), ISO-3166-2 for states (`US-TX`). */
  id: z.string().min(2).max(8),
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
