import { z } from "zod";

import { iso2ToIso3166Alpha3 } from "@/lib/geo/iso2-to-iso3";
import { placeSearchResultSchema, type PlaceSearchResult } from "@/lib/schemas/place";

const geocodeRowSchema = z.looseObject({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country_code: z.string(),
  country: z.string(),
  admin1: z.string().optional(),
  admin2: z.string().optional(),
  feature_code: z.string().optional(),
});

type GeocodeRow = z.infer<typeof geocodeRowSchema>;

const geocodeResponseSchema = z.looseObject({
  results: z.array(geocodeRowSchema).optional(),
});

/** Populated-place-ish codes from Open-Meteo (subset of GeoNames feature codes). */
const CITY_LIKE = new Set([
  "PPL",
  "PPLA",
  "PPLA2",
  "PPLA3",
  "PPLA4",
  "PPLC",
  "PPLF",
  "PPLG",
  "PPLH",
  "PPLL",
  "PPLQ",
  "PPLR",
  "PPLS",
  "PPLW",
  "PPLX",
]);

function isCityLikeFeatureCode(code: string | undefined): boolean {
  if (!code) return true;
  return CITY_LIKE.has(code.toUpperCase());
}

function subtitleForCity(r: GeocodeRow): string {
  const parts = [r.admin2, r.admin1, r.country].filter(Boolean);
  return parts.join(" · ");
}

/**
 * Parses Open-Meteo Geocoding API JSON into normalized city {@link PlaceSearchResult} rows.
 */
export function parseOpenMeteoGeocodeToPlaces(data: unknown, max = 8): PlaceSearchResult[] {
  const parsed = geocodeResponseSchema.safeParse(data);
  if (!parsed.success || !parsed.data.results?.length) {
    return [];
  }

  const out: PlaceSearchResult[] = [];
  for (const r of parsed.data.results) {
    if (!isCityLikeFeatureCode(r.feature_code)) continue;
    if (!Number.isFinite(r.latitude) || !Number.isFinite(r.longitude)) continue;

    const rawCode = typeof r.country_code === "string" ? r.country_code.trim() : "";
    if (rawCode.length !== 2) continue;
    const iso2 = rawCode.toUpperCase();
    const row = {
      kind: "city" as const,
      id: `city-${r.id}`,
      name: r.name,
      capital: subtitleForCity(r),
      lat: r.latitude,
      lon: r.longitude,
      iso2,
      iso3: iso2ToIso3166Alpha3(iso2),
    };

    const ok = placeSearchResultSchema.safeParse(row);
    if (ok.success) {
      out.push(ok.data);
    }
    if (out.length >= max) break;
  }
  return out;
}
