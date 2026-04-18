"use client";

import { CancelledError, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { LearnDialog } from "@/components/education/LearnDialog";
import { PlaceSearchSuggestions } from "@/components/warmth/PlaceSearchSuggestions";
import { SelectedPlaceRow } from "@/components/warmth/SelectedPlaceRow";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchCurrentWeather, fetchPlaceSearch } from "@/lib/api/warmth-client";
import { getErrorMessage, isAbortError } from "@/lib/errors/guards";
import { APP_TAGLINE } from "@/lib/product/education-content";
import { useDebouncedValue } from "@/lib/react/use-debounced-value";
import { PLACE_SEARCH_MIN_QUERY_LEN, PLACE_SEARCH_QUERY_MAX_LEN } from "@/lib/search/place-search-config";
import type { PlaceSearchResult } from "@/lib/schemas/place";
import type { SelectedCountry } from "@/lib/store/country-store";
import { useCountryStore } from "@/lib/store/country-store";
import { formatTemperature } from "@/lib/warmth/colorFromTemp";

const SEARCH_STALE_MS = 10 * 60_000;
const WEATHER_STALE_MS = 2 * 60_000;
const SEARCH_DEBOUNCE_MS = 320;

/** Once set, the large “Start your tour” empty state is not shown again (cleared list uses a short line). */
const RICH_EMPTY_INTRO_KEY = "fun-map-rich-empty-intro-seen";

/**
 * Debounced place search (typeahead), unit toggle, and stacked rows with remove/clear.
 * Copy and touch targets lean toward ages ~9–16: concrete labels, encouragement, ~44px+ actions (NN/g, BBC GEL).
 */
export function CountryPanel() {
  const queryClient = useQueryClient();
  const [richIntroDismissed, setRichIntroDismissed] = useState(false);
  const [introPrefHydrated, setIntroPrefHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const inputTrim = query.trim();
  const debouncedTrim = debouncedQuery.trim();
  const isDebouncing =
    inputTrim.length >= PLACE_SEARCH_MIN_QUERY_LEN && inputTrim !== debouncedTrim;
  const showTypeahead = inputTrim.length >= PLACE_SEARCH_MIN_QUERY_LEN;
  const searchEnabled = debouncedTrim.length >= PLACE_SEARCH_MIN_QUERY_LEN;

  const placeSearch = useQuery({
    queryKey: ["place-search", debouncedTrim] as const,
    queryFn: ({ signal }) => fetchPlaceSearch(debouncedTrim, signal),
    enabled: searchEnabled,
    staleTime: SEARCH_STALE_MS,
    gcTime: 30 * 60_000,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, err) => {
      if (isAbortError(err)) return false;
      return failureCount < 1;
    },
  });

  const suggestions: PlaceSearchResult[] = useMemo(
    () => (searchEnabled ? (placeSearch.data ?? []) : []),
    [searchEnabled, placeSearch.data],
  );
  const searchBusy = searchEnabled && (placeSearch.isFetching || placeSearch.isPending);

  useEffect(() => {
    startTransition(() => {
      try {
        setRichIntroDismissed(localStorage.getItem(RICH_EMPTY_INTRO_KEY) === "1");
      } catch {
        setRichIntroDismissed(true);
      }
      setIntroPrefHydrated(true);
    });
  }, []);

  const dismissRichEmptyIntro = useCallback(() => {
    try {
      localStorage.setItem(RICH_EMPTY_INTRO_KEY, "1");
    } catch {
      /* private / quota */
    }
    setRichIntroDismissed(true);
  }, []);

  const { countries, tempDisplayUnit, setTempDisplayUnit, upsertCountry, removeCountry, clearAll } =
    useCountryStore(
      useShallow((s) => ({
        countries: s.countries,
        tempDisplayUnit: s.tempDisplayUnit,
        setTempDisplayUnit: s.setTempDisplayUnit,
        upsertCountry: s.upsertCountry,
        removeCountry: s.removeCountry,
        clearAll: s.clearAll,
      })),
    );

  const addCountry = useMutation({
    mutationFn: async (place: PlaceSearchResult) => {
      await queryClient.cancelQueries({
        predicate: (q) => q.queryKey[0] === "weather-current",
      });
      const { temperatureC, observedAt } = await queryClient.fetchQuery({
        queryKey: ["weather-current", place.lat, place.lon] as const,
        queryFn: ({ signal }) => fetchCurrentWeather(place.lat, place.lon, signal),
        staleTime: WEATHER_STALE_MS,
        gcTime: 15 * 60_000,
      });
      return { place, tempC: temperatureC, observedAt };
    },
    onSuccess: ({ place, tempC, observedAt }) => {
      upsertCountry({
        id: place.id,
        kind: place.kind,
        iso2: place.iso2,
        iso3: place.iso3,
        name: place.name,
        capital: place.capital,
        lat: place.lat,
        lon: place.lon,
        tempC,
        observedAt,
      });
      const unit = useCountryStore.getState().tempDisplayUnit;
      const description =
        place.kind === "country"
          ? `Near ${place.capital}: ${formatTemperature(tempC, unit)}`
          : place.kind === "us_state"
            ? `${formatTemperature(tempC, unit)} · Natural Earth reference (U.S. state)`
            : `${formatTemperature(tempC, unit)} · City center (Open-Meteo)`;
      dismissRichEmptyIntro();
      toast.success(`Nice — ${place.name} is on the map!`, {
        description,
      });
    },
    onError: (e: unknown) => {
      if (e instanceof CancelledError) return;
      toast.error(e instanceof Error ? e.message : "Could not add country");
    },
  });

  const tryAddFromSearch = useCallback(() => {
    if (!inputTrim || addCountry.isPending) return;
    if (isDebouncing) {
      toast.message("Pause typing for a moment so the list can catch up.");
      return;
    }
    if (!searchEnabled) return;
    if (placeSearch.isError) {
      if (isAbortError(placeSearch.error)) return;
      toast.error(getErrorMessage(placeSearch.error, "Search failed"));
      return;
    }
    if (searchBusy) {
      toast.message("Still loading matches — try again in a second.");
      return;
    }
    if (suggestions.length === 0) {
      toast.message("No matches yet — try a different spelling or a longer name.");
      return;
    }
    if (suggestions.length === 1) {
      setQuery("");
      addCountry.mutate(suggestions[0]);
      return;
    }
    toast.message("More than one match — tap the row you want in the list.");
  }, [
    inputTrim,
    addCountry,
    isDebouncing,
    searchEnabled,
    placeSearch.isError,
    placeSearch.error,
    searchBusy,
    suggestions,
  ]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      tryAddFromSearch();
    },
    [tryAddFromSearch],
  );

  const pickCandidate = useCallback(
    (c: PlaceSearchResult) => {
      setQuery("");
      addCountry.mutate(c);
    },
    [addCountry],
  );

  const handleRemovePlace = useCallback(
    (place: SelectedCountry) => {
      removeCountry(place.id);
      toast.message(`${place.name} is off your map.`);
    },
    [removeCountry],
  );

  const handleClearAll = useCallback(() => {
    clearAll();
    toast.message("Map cleared. Add a new place whenever you like.");
  }, [clearAll]);

  return (
    <Card className="border-border/60 bg-card flex h-full max-h-full min-h-0 w-full max-w-md flex-col gap-0 overflow-x-hidden overflow-y-hidden rounded-2xl py-2 shadow-xl ring-1 ring-primary/10 max-lg:h-full sm:gap-0 sm:py-4 sm:shadow-2xl dark:ring-primary/20">
      <CardHeader className="max-lg:space-y-1.5 max-lg:pb-1.5 shrink-0 space-y-2 px-2.5 pb-2 sm:space-y-2.5 sm:px-4 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <CardTitle className="font-heading text-card-foreground text-2xl leading-tight tracking-tight sm:text-3xl">
              Warmth Atlas
            </CardTitle>
            <details className="group max-lg:block lg:hidden">
              <summary className="text-primary hover:text-primary/90 cursor-pointer list-none py-0.5 text-xs font-semibold underline-offset-2 marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="underline decoration-primary/40 decoration-dotted underline-offset-2">
                  What is this app?
                </span>
              </summary>
              <p className="text-muted-foreground mt-1.5 max-w-prose text-xs leading-snug sm:text-sm">
                {APP_TAGLINE}
              </p>
            </details>
          </div>
          <div className="shrink-0 pt-0.5">
            <ThemeToggle />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative isolate flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-2.5 max-lg:gap-2 sm:gap-5 sm:px-4">
        <form
          onSubmit={onSubmit}
          className="max-lg:order-1 shrink-0 space-y-2 sm:space-y-3 lg:order-1"
        >
          <p className="text-muted-foreground -mt-0.5 hidden text-xs leading-snug lg:block lg:text-sm">
            Start typing a country, U.S. state, or city—we search after you pause about{" "}
            {(SEARCH_DEBOUNCE_MS / 1000).toFixed(1)}s. Exact name matches float to the top.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Input
              id="country-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Japan, Texas, San Francisco…"
              autoComplete="off"
              maxLength={PLACE_SEARCH_QUERY_MAX_LEN}
              disabled={addCountry.isPending}
              inputMode="search"
              enterKeyHint="search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showTypeahead && !isDebouncing}
              aria-controls="place-search-suggestions"
              className="border-primary/15 focus-visible:ring-primary/40 min-h-11 flex-1 rounded-xl text-base sm:h-12 sm:min-h-0"
            />
            <Button
              type="submit"
              size="lg"
              disabled={addCountry.isPending || !inputTrim}
              className="min-h-11 w-full shrink-0 gap-2 rounded-xl px-4 text-base font-semibold shadow-md touch-manipulation sm:min-h-12 sm:w-auto sm:px-6"
            >
              {addCountry.isPending ? (
                <Loader2 className="size-5 shrink-0 animate-spin" />
              ) : (
                <MapPin className="size-5 shrink-0" aria-hidden />
              )}
              Add to map
            </Button>
          </div>
        </form>

        {showTypeahead ? (
          <PlaceSearchSuggestions
            debouncedLabel={debouncedTrim}
            isDebouncing={isDebouncing}
            isError={placeSearch.isError}
            errorMessage={
              placeSearch.isError && !isAbortError(placeSearch.error)
                ? getErrorMessage(placeSearch.error, "Search failed")
                : null
            }
            searchBusy={searchBusy}
            suggestions={suggestions}
            isFetching={placeSearch.isFetching}
            onPick={pickCandidate}
            addPending={addCountry.isPending}
          />
        ) : null}

        <div className="max-lg:order-3 relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden lg:order-4">
          <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2 sm:mb-2">
            <span className="text-foreground inline-flex items-center gap-2 text-sm font-semibold sm:text-base">
              Your places
              <span className="bg-primary/15 text-primary border-primary/20 rounded-full border px-2 py-0.5 text-xs tabular-nums sm:text-sm">
                {countries.length}
              </span>
            </span>
            {countries.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive min-h-10 touch-manipulation gap-1.5 rounded-lg px-2 text-xs sm:min-h-9 sm:text-sm"
                onClick={handleClearAll}
              >
                <X className="size-3.5 shrink-0" />
                Clear all
              </Button>
            ) : null}
          </div>

          {countries.length === 0 ? (
            introPrefHydrated && !richIntroDismissed ? (
              <div className="border-primary/15 from-muted/40 to-accent/12 text-muted-foreground shrink-0 space-y-2 rounded-2xl border border-dashed bg-linear-to-br p-3 sm:space-y-2.5 sm:p-4">
                <div className="text-primary flex items-center gap-2 text-sm font-semibold sm:text-base">
                  <Sparkles className="size-4 shrink-0 sm:size-5" aria-hidden />
                  Start your tour
                </div>
                <p className="text-xs leading-relaxed sm:text-sm">
                  Add a country, U.S. state, or city above. Each place gets a flag, a color from today&apos;s air
                  temperature, and a spin on the globe so you can compare the world in one glance.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-1 w-full touch-manipulation sm:w-auto"
                  onClick={dismissRichEmptyIntro}
                >
                  Got it
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground border-border/50 shrink-0 rounded-xl border border-dashed px-3 py-2.5 text-xs leading-relaxed sm:text-sm">
                No places yet. Search above to add a country, U.S. state, or city.
              </p>
            )
          ) : (
            <div className="min-h-0 flex-1 overflow-hidden pr-0.5 lg:pr-1">
              <ScrollArea className="h-full max-h-full min-h-0 lg:max-h-[min(56vh,520px)] lg:min-h-56">
                <ul className="max-lg:space-y-1.5 space-y-2 pb-1 lg:pr-2">
                  {[...countries].reverse().map((c) => (
                    <SelectedPlaceRow
                      key={c.id}
                      place={c}
                      tempDisplayUnit={tempDisplayUnit}
                      onRemove={handleRemovePlace}
                    />
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="relative z-0 space-y-1.5 pt-1 max-lg:order-4 max-lg:shrink-0 max-lg:rounded-xl max-lg:border max-lg:border-border/60 max-lg:bg-card/85 max-lg:px-2.5 max-lg:py-2 max-lg:backdrop-blur-sm sm:mt-0 sm:space-y-2 sm:pt-0 lg:order-3 lg:border-0 lg:bg-transparent lg:p-0">
          <span className="text-foreground text-sm font-semibold max-lg:text-xs">
            Show temperatures in
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={tempDisplayUnit === "C" ? "default" : "secondary"}
              className="h-9 min-w-11 touch-manipulation rounded-xl px-3 text-sm font-bold tabular-nums sm:h-10 sm:min-w-12 sm:text-base"
              onClick={() => setTempDisplayUnit("C")}
              aria-pressed={tempDisplayUnit === "C"}
            >
              °C
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tempDisplayUnit === "F" ? "default" : "secondary"}
              className="h-9 min-w-11 touch-manipulation rounded-xl px-3 text-sm font-bold tabular-nums sm:h-10 sm:min-w-12 sm:text-base"
              onClick={() => setTempDisplayUnit("F")}
              aria-pressed={tempDisplayUnit === "F"}
            >
              °F
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-border/60 max-lg:gap-1.5 max-lg:py-2 shrink-0 flex flex-col gap-2.5 border-t px-2.5 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <nav
          className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 sm:justify-start sm:gap-x-5"
          aria-label="Help and legal"
        >
          <LearnDialog />
          <Link
            href="/educators"
            className="text-primary text-xs font-medium underline-offset-4 hover:underline sm:text-sm"
          >
            Educators
          </Link>
          <Link href="/privacy" className="text-xs underline-offset-4 hover:underline sm:text-sm">
            Privacy
          </Link>
        </nav>
        <p className="text-muted-foreground max-lg:hidden text-center text-[10px] leading-snug sm:text-left sm:text-xs">
          Live temperatures from Open-Meteo · Map shapes from Natural Earth · Names from REST Countries (see Learn
          for details).
        </p>
      </CardFooter>
    </Card>
  );
}
