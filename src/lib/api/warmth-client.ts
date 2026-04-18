import { PLACE_SEARCH_MIN_QUERY_LEN, PLACE_SEARCH_QUERY_MAX_LEN } from "@/lib/search/place-search-config";
import { placeSearchResponseSchema, type PlaceSearchResult } from "@/lib/schemas/place";
import { weatherCurrentResponseSchema } from "@/lib/schemas/weather";

function parseApiErrorBody(err: unknown): string | null {
  if (typeof err !== "object" || err === null) return null;
  if (!("error" in err)) return null;
  const e = (err as { error: unknown }).error;
  return typeof e === "string" && e.trim() ? e : null;
}

/**
 * Fetches normalized place search results from the app API.
 * @param q — trimmed or untrimmed query; must stay within server length bounds (see `place-search-config`).
 * @param signal — optional abort for superseded searches
 */
export async function fetchPlaceSearch(q: string, signal?: AbortSignal): Promise<PlaceSearchResult[]> {
  const trimmed = q.trim();
  if (trimmed.length < PLACE_SEARCH_MIN_QUERY_LEN) {
    throw new Error(`Use at least ${PLACE_SEARCH_MIN_QUERY_LEN} characters.`);
  }
  if (trimmed.length > PLACE_SEARCH_QUERY_MAX_LEN) {
    throw new Error(`Use at most ${PLACE_SEARCH_QUERY_MAX_LEN} characters.`);
  }

  const res = await fetch(`/api/countries/search?q=${encodeURIComponent(trimmed)}`, {
    signal,
    credentials: "same-origin",
  });
  if (!res.ok) {
    const err: unknown = await res.json().catch(() => ({}));
    const msg = parseApiErrorBody(err) ?? "Search failed";
    throw new Error(msg);
  }
  const json: unknown = await res.json().catch(() => {
    throw new Error("Invalid response from search.");
  });
  const parsed = placeSearchResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Unexpected search response shape.");
  }
  return parsed.data.results;
}

export type CurrentWeatherPayload = {
  temperatureC: number;
  observedAt: string | null;
};

/**
 * Current temperature at a point (capital / reference coordinates).
 */
export async function fetchCurrentWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<CurrentWeatherPayload> {
  const res = await fetch(
    `/api/weather/current?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
    { signal, credentials: "same-origin" },
  );
  if (!res.ok) {
    const err: unknown = await res.json().catch(() => ({}));
    const msg = parseApiErrorBody(err) ?? "Weather failed";
    throw new Error(msg);
  }
  const json: unknown = await res.json().catch(() => {
    throw new Error("Invalid response from weather.");
  });
  const parsed = weatherCurrentResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Unexpected weather response shape.");
  }
  return {
    temperatureC: parsed.data.temperatureC,
    observedAt: parsed.data.observedAt ?? null,
  };
}
