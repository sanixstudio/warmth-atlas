import circle from "@turf/circle";
import type { Feature, Polygon } from "geojson";

/** Approximate “city area” on the map (no official admin boundary in MVP). */
export const CITY_HIGHLIGHT_RADIUS_KM = 18;

/**
 * Circle polygon around a city center for warmth fill on the globe.
 */
export function cityWarmthCircle(lon: number, lat: number): Feature<Polygon> {
  return circle([lon, lat], CITY_HIGHLIGHT_RADIUS_KM, {
    steps: 48,
    units: "kilometers",
  });
}
