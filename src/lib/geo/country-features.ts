import centroid from "@turf/centroid";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import bbox from "@turf/bbox";

type NEProperties = {
  ISO_A2?: string;
  ADM0_A3?: string;
  /** Natural Earth map-label longitude (degrees). */
  LABEL_X?: number;
  /** Natural Earth map-label latitude (degrees). */
  LABEL_Y?: number;
};

/**
 * Finds the Natural Earth feature for a country using ISO 3166-1 alpha-2, then alpha-3.
 * Some NE rows use -99 for ISO_A2; ADM0_A3 still matches REST Countries `cca3`.
 */
export function findCountryFeature(
  collection: FeatureCollection,
  iso2: string,
  iso3: string,
): Feature<Geometry, NEProperties> | undefined {
  const a2 = iso2.toUpperCase();
  const a3 = iso3.toUpperCase();

  for (const f of collection.features) {
    const p = f.properties as NEProperties | null;
    if (!p?.ISO_A2) continue;
    if (p.ISO_A2 === "-99") continue;
    if (p.ISO_A2.toUpperCase() === a2) {
      return f as Feature<Geometry, NEProperties>;
    }
  }

  for (const f of collection.features) {
    const p = f.properties as NEProperties | null;
    if (p?.ADM0_A3?.toUpperCase() === a3) {
      return f as Feature<Geometry, NEProperties>;
    }
  }

  return undefined;
}

/** WGS84 bbox for `fitBounds`: west, south, east, north (from Turf). */
export function featureBBox(feature: Feature): [number, number, number, number] {
  const b = bbox(feature);
  return [b[0], b[1], b[2], b[3]];
}

/**
 * Longitude/latitude for a country label: Natural Earth’s interior label point when present,
 * otherwise centroid of the boundary geometry.
 */
export function getCountryLabelLngLat(feature: Feature): [number, number] {
  const p = feature.properties as NEProperties | null;
  if (
    p &&
    typeof p.LABEL_X === "number" &&
    typeof p.LABEL_Y === "number" &&
    Number.isFinite(p.LABEL_X) &&
    Number.isFinite(p.LABEL_Y)
  ) {
    return [p.LABEL_X, p.LABEL_Y];
  }

  const c = centroid(feature);
  const coords = c.geometry.coordinates;
  return [coords[0], coords[1]];
}
