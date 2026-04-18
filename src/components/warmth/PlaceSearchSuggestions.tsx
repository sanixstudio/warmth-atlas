"use client";

import { Loader2 } from "lucide-react";

import { PlaceFlagImg } from "@/components/warmth/PlaceFlagImg";
import { Button } from "@/components/ui/button";
import { placeSearchResultListSubtitle } from "@/lib/search/place-search-helpers";
import type { PlaceSearchResult } from "@/lib/schemas/place";

export type PlaceSearchSuggestionsProps = {
  /** Debounced query string used for the last successful search. */
  debouncedLabel: string;
  isDebouncing: boolean;
  isError: boolean;
  errorMessage: string | null;
  /** True while the first load or a refetch is in flight. */
  searchBusy: boolean;
  suggestions: PlaceSearchResult[];
  isFetching: boolean;
  onPick: (place: PlaceSearchResult) => void;
  addPending: boolean;
};

/**
 * Opaque typeahead list under the search field: loading, empty, error, or selectable rows.
 */
export function PlaceSearchSuggestions({
  debouncedLabel,
  isDebouncing,
  isError,
  errorMessage,
  searchBusy,
  suggestions,
  isFetching,
  onPick,
  addPending,
}: PlaceSearchSuggestionsProps) {
  return (
    <div
      id="place-search-suggestions"
      role="region"
      aria-label="Search suggestions"
      className="border-border bg-card text-card-foreground relative z-30 max-lg:order-2 max-h-52 min-h-0 shrink-0 overflow-hidden rounded-2xl border shadow-lg ring-1 ring-border/60 lg:order-2"
    >
      {isDebouncing ? (
        <p className="text-muted-foreground px-3 py-3 text-sm">
          Pausing search… keep typing or wait a moment for &quot;{debouncedLabel}&quot;.
        </p>
      ) : isError ? (
        <p className="text-destructive px-3 py-3 text-sm">{errorMessage ?? "Search failed"}</p>
      ) : searchBusy && suggestions.length === 0 ? (
        <div className="text-muted-foreground flex items-center gap-2 px-3 py-3 text-sm">
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          Finding places…
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-muted-foreground px-3 py-3 text-sm">
          No matches for &quot;{debouncedLabel}&quot; yet—try different spelling.
        </p>
      ) : (
        <div className="flex max-h-52 flex-col">
          <p className="text-muted-foreground border-b border-border/80 bg-muted/50 px-3 py-2 text-xs font-medium">
            {suggestions.length} match{suggestions.length === 1 ? "" : "es"} for &quot;{debouncedLabel}&quot;
            {isFetching ? " · updating…" : ""}
          </p>
          <ul
            role="listbox"
            aria-label="Places matching your search"
            className="max-h-[min(13rem,40svh)] overflow-y-auto overscroll-contain p-1.5 sm:max-h-52"
          >
            {suggestions.map((c) => (
              <li key={`${c.kind}-${c.id}`} role="presentation">
                <Button
                  type="button"
                  role="option"
                  variant="ghost"
                  className="hover:bg-muted flex min-h-11 w-full touch-manipulation items-center gap-2 rounded-xl py-2 text-left sm:min-h-12 sm:py-2.5"
                  onClick={() => onPick(c)}
                  disabled={addPending}
                >
                  <PlaceFlagImg candidate={c} className="!size-6 shrink-0 sm:!size-7" />
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      {placeSearchResultListSubtitle(c)}
                    </span>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
