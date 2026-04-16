import { z } from "zod";

/**
 * Single REST Countries API v3.1 name lookup record (fields we consume).
 * `z.looseObject` replaces deprecated `.passthrough()` — unknown top-level keys are allowed;
 * nested API objects use `looseObject` where responses include extra fields.
 */
export const restCountryRecordSchema = z.looseObject({
  cca2: z.string(),
  cca3: z.string(),
  name: z.looseObject({ common: z.string() }),
  capital: z.array(z.string()).optional(),
  capitalInfo: z
    .looseObject({
      latlng: z.tuple([z.number(), z.number()]),
    })
    .optional(),
  latlng: z.tuple([z.number(), z.number()]),
});

export type RestCountryRecord = z.infer<typeof restCountryRecordSchema>;

export const countrySearchResultSchema = z.object({
  iso2: z.string().min(2).max(2),
  iso3: z.string().min(3).max(3),
  name: z.string(),
  capital: z.string(),
  lat: z.number(),
  lon: z.number(),
});

export type CountrySearchResult = z.infer<typeof countrySearchResultSchema>;

export const countrySearchResponseSchema = z.object({
  results: z.array(countrySearchResultSchema),
});

export type CountrySearchResponse = z.infer<typeof countrySearchResponseSchema>;

/** Parse REST Countries JSON array into normalized search results. */
export function parseRestCountriesArray(data: unknown): CountrySearchResult[] {
  const arr = z.array(restCountryRecordSchema).safeParse(data);
  if (!arr.success) {
    return [];
  }

  const results: CountrySearchResult[] = [];
  for (const r of arr.data) {
    const lat =
      r.capitalInfo?.latlng?.[0] ??
      r.latlng[0];
    const lon =
      r.capitalInfo?.latlng?.[1] ??
      r.latlng[1];
    const capitalName = r.capital?.[0] ?? "—";

    const parsed = countrySearchResultSchema.safeParse({
      iso2: r.cca2.toUpperCase(),
      iso3: r.cca3.toUpperCase(),
      name: r.name.common,
      capital: capitalName,
      lat,
      lon,
    });
    if (parsed.success) {
      results.push(parsed.data);
    }
  }
  return results;
}
