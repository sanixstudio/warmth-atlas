import centroid from "@turf/centroid";
import type { Feature, FeatureCollection, Geometry } from "geojson";

type NEStateProperties = {
  postal?: string;
  iso_3166_2?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
};

/** Interior label coordinates from Natural Earth when present; otherwise polygon centroid. */
export function getUsStateLabelLngLat(feature: Feature): [number, number] {
  const p = feature.properties as NEStateProperties | null;
  if (
    p &&
    typeof p.latitude === "number" &&
    typeof p.longitude === "number" &&
    Number.isFinite(p.latitude) &&
    Number.isFinite(p.longitude)
  ) {
    return [p.longitude, p.latitude];
  }
  const c = centroid(feature);
  const coords = c.geometry.coordinates;
  return [coords[0], coords[1]];
}

/**
 * Finds a U.S. state / D.C. polygon by ISO 3166-2 subdivision id (`US-TX`, `US-DC`, …).
 */
export function findUsStateFeature(
  collection: FeatureCollection,
  iso3166_2: string,
): Feature<Geometry, NEStateProperties> | undefined {
  const id = iso3166_2.trim().toUpperCase();
  for (const f of collection.features) {
    const p = f.properties as NEStateProperties | null;
    if (p?.iso_3166_2?.toUpperCase() === id) {
      return f as Feature<Geometry, NEStateProperties>;
    }
  }
  return undefined;
}
