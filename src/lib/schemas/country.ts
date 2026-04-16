import { z } from "zod";

import { placeSearchResultSchema, type PlaceSearchResult } from "@/lib/schemas/place";

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

/** Parse REST Countries JSON array into unified {@link PlaceSearchResult} rows. */
export function parseRestCountriesArray(data: unknown): PlaceSearchResult[] {
  const arr = z.array(restCountryRecordSchema).safeParse(data);
  if (!arr.success) {
    return [];
  }

  const results: PlaceSearchResult[] = [];
  for (const r of arr.data) {
    const lat =
      r.capitalInfo?.latlng?.[0] ??
      r.latlng[0];
    const lon =
      r.capitalInfo?.latlng?.[1] ??
      r.latlng[1];
    const capitalName = r.capital?.[0] ?? "—";

    const iso2 = r.cca2.toUpperCase();
    const iso3 = r.cca3.toUpperCase();
    const row: PlaceSearchResult = {
      kind: "country",
      id: iso2,
      name: r.name.common,
      capital: capitalName,
      lat,
      lon,
      iso2,
      iso3,
    };
    const parsed = placeSearchResultSchema.safeParse(row);
    if (parsed.success) {
      results.push(parsed.data);
    }
  }
  return results;
}
