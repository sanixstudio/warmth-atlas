import { normalizePlaceLabel } from "@/lib/search/merge-place-search";
import type { PlaceSearchResult } from "@/lib/schemas/place";

/**
 * Whether two display names are the same after normalization (case, spacing).
 */
export function placeNamesEqual(a: string, b: string): boolean {
  return normalizePlaceLabel(a) === normalizePlaceLabel(b);
}

/**
 * Secondary line for a search hit row (sidebar typeahead list).
 */
export function placeSearchResultListSubtitle(p: PlaceSearchResult): string {
  if (p.kind === "country") {
    const cap = p.capital.trim() || "—";
    return `${p.iso2} · ${cap}`;
  }
  if (p.kind === "us_state") {
    return `U.S. state · ${p.id}`;
  }
  return p.capital;
}
