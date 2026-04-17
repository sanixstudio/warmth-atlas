import { placeSearchResponseSchema, type PlaceSearchResult } from "@/lib/schemas/place";
import { weatherCurrentResponseSchema } from "@/lib/schemas/weather";

/**
 * Fetches normalized place search results from the app API.
 * @param q — trimmed or untrimmed query (server validates length)
 * @param signal — optional abort for superseded searches
 */
export async function fetchPlaceSearch(q: string, signal?: AbortSignal): Promise<PlaceSearchResult[]> {
  const res = await fetch(`/api/countries/search?q=${encodeURIComponent(q.trim())}`, {
    signal,
    credentials: "same-origin",
  });
  if (!res.ok) {
    const err: unknown = await res.json().catch(() => ({}));
    const msg =
      typeof err === "object" && err !== null && "error" in err && typeof (err as { error: unknown }).error === "string"
        ? (err as { error: string }).error
        : "Search failed";
    throw new Error(msg);
  }
  const json: unknown = await res.json();
  const parsed = placeSearchResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Unexpected search response");
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
    const msg =
      typeof err === "object" && err !== null && "error" in err && typeof (err as { error: unknown }).error === "string"
        ? (err as { error: string }).error
        : "Weather failed";
    throw new Error(msg);
  }
  const json: unknown = await res.json();
  const parsed = weatherCurrentResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Unexpected weather response");
  }
  return {
    temperatureC: parsed.data.temperatureC,
    observedAt: parsed.data.observedAt ?? null,
  };
}
