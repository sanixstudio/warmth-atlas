import { normalizePlaceLabel } from "@/lib/search/merge-place-search";
import { PLACE_SEARCH_CITY_EXACT_DEDUPE_MAX } from "@/lib/search/place-search-config";
import { placeNamesEqual } from "@/lib/search/place-search-helpers";
import type { PlaceSearchResult } from "@/lib/schemas/place";

/** Strongest match: normalized place name equals the normalized query. */
const SCORE_EXACT = 1000;
/** Place name starts with the query (after normalize). */
const SCORE_PREFIX = 800;
/** Query length ≥ 4 and name contains query (avoids noisy short substring hits). */
const SCORE_CONTAINS_LONG = 500;
/** Name contains query (shorter queries). */
const SCORE_CONTAINS = 350;

/**
 * Scores how well a place name matches the normalized query string.
 */
export function placeNameMatchScore(qNorm: string, place: PlaceSearchResult): number {
  const nameNorm = normalizePlaceLabel(place.name);
  if (!qNorm || !nameNorm) return 0;
  if (nameNorm === qNorm) return SCORE_EXACT;
  if (nameNorm.startsWith(qNorm)) return SCORE_PREFIX;
  if (qNorm.length >= 4 && nameNorm.includes(qNorm)) return SCORE_CONTAINS_LONG;
  if (nameNorm.includes(qNorm)) return SCORE_CONTAINS;
  return 0;
}

/**
 * Dedupes by `id`, ranks by match quality, then narrows the list:
 * when at least one **exact** name match exists, only exact matches are returned (so
 * `india` surfaces India the country, not Indiana or unrelated “India” hamlets).
 * Otherwise returns the best prefix / substring matches, capped at `max`.
 */
export function rankSearchResults(
  rawQuery: string,
  items: PlaceSearchResult[],
  max: number,
): PlaceSearchResult[] {
  const qn = normalizePlaceLabel(rawQuery);
  const cap = Number.isFinite(max) && max > 0 ? Math.min(Math.floor(max), 500) : 0;
  if (!qn || cap <= 0) return [];

  const seen = new Set<string>();
  const unique: PlaceSearchResult[] = [];
  for (const p of items) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    unique.push(p);
  }

  const scored = unique.map((item) => ({
    item,
    score: placeNameMatchScore(qn, item),
  }));

  const hasExact = scored.some((s) => placeNamesEqual(s.item.name, rawQuery));
  const filtered = hasExact
    ? scored.filter((s) => placeNamesEqual(s.item.name, rawQuery))
    : scored.filter((s) => s.score > 0);

  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.name.length - b.item.name.length;
  });

  let out = filtered.slice(0, cap).map((s) => s.item);
  if (
    out.length > PLACE_SEARCH_CITY_EXACT_DEDUPE_MAX &&
    out.every((p) => p.kind === "city") &&
    out.every((p) => placeNamesEqual(p.name, out[0].name))
  ) {
    out = out.slice(0, PLACE_SEARCH_CITY_EXACT_DEDUPE_MAX);
  }
  return out;
}
