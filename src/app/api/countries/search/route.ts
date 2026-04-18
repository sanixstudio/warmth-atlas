import { NextResponse } from "next/server";
import { z } from "zod";

import { parseRestCountriesArray } from "@/lib/schemas/country";
import { placeSearchResponseSchema } from "@/lib/schemas/place";
import { clientKeyFromRequest, checkRateLimit } from "@/lib/security/simple-rate-limit";
import { mergeCountriesStatesAndCities } from "@/lib/search/merge-place-search";
import { parseOpenMeteoGeocodeToPlaces } from "@/lib/search/open-meteo-geocode";
import { rankSearchResults } from "@/lib/search/rank-place-search";
import { searchUsStates } from "@/lib/search/us-states-search";

const SEARCH_RATE = { max: 60, windowMs: 60_000 } as const;

const querySchema = z.object({
  q: z.string().min(2, "Use at least 2 characters").max(120),
});

const SEARCH_RESULTS_MAX = 14;

/**
 * Place search: REST Countries + bundled U.S. states + Open-Meteo geocoding (cities).
 * Geocoding is skipped when REST returns countries (saves a round trip). Results are
 * ranked and narrowed (exact name matches win) before JSON is returned.
 */
export async function GET(request: Request) {
  if (!checkRateLimit(`search:${clientKeyFromRequest(request)}`, SEARCH_RATE)) {
    return NextResponse.json({ error: "Too many searches. Try again in a minute." }, { status: 429 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ q: url.searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { q } = parsed.data;
  const trimmed = q.trim();
  const upstream = encodeURIComponent(trimmed);

  const restRes = await fetch(
    `https://restcountries.com/v3.1/name/${upstream}?fields=cca2,cca3,name,capital,capitalInfo,latlng`,
    { next: { revalidate: 3600 } },
  );

  const states = searchUsStates(q);

  let countries: ReturnType<typeof parseRestCountriesArray> = [];
  if (restRes.status === 200) {
    const json: unknown = await restRes.json();
    countries = parseRestCountriesArray(json);
  } else if (restRes.status !== 404) {
    return NextResponse.json(
      { error: "Country lookup failed", status: restRes.status },
      { status: 502 },
    );
  }

  const needsGeocode = countries.length === 0 || states.length > 0;
  let cities: ReturnType<typeof parseOpenMeteoGeocodeToPlaces> = [];
  if (needsGeocode) {
    const geoCount = countries.length === 0 && states.length === 0 ? 14 : 10;
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=${geoCount}&language=en`,
      { next: { revalidate: 3600 } },
    );
    if (geoRes.ok) {
      const geoJson: unknown = await geoRes.json();
      cities = parseOpenMeteoGeocodeToPlaces(geoJson, geoCount);
    }
  }

  const merged = mergeCountriesStatesAndCities(countries, states, cities);
  const results = rankSearchResults(trimmed, merged, SEARCH_RESULTS_MAX);
  const body = placeSearchResponseSchema.parse({ results });

  return NextResponse.json(body);
}
