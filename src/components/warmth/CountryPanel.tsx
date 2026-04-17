"use client";

import { isCancelledError, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListChecks, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { LearnDialog } from "@/components/education/LearnDialog";
import { PlaceFlagImg } from "@/components/warmth/PlaceFlagImg";
import { SelectedPlaceRow } from "@/components/warmth/SelectedPlaceRow";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchCurrentWeather, fetchPlaceSearch } from "@/lib/api/warmth-client";
import type { PlaceSearchResult } from "@/lib/schemas/place";
import type { SelectedCountry } from "@/lib/store/country-store";
import { useCountryStore } from "@/lib/store/country-store";
import { formatTemperature } from "@/lib/warmth/colorFromTemp";

const SEARCH_STALE_MS = 10 * 60_000;
const WEATHER_STALE_MS = 2 * 60_000;

/**
 * Search, disambiguation list, unit toggle, and stacked country rows with remove/clear.
 */
export function CountryPanel() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  /** Phrase shown when several matches need picking (input is cleared after search). */
  const [choiceMatchPhrase, setChoiceMatchPhrase] = useState("");
  const [candidates, setCandidates] = useState<PlaceSearchResult[] | null>(null);
  const choicePanelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!candidates || candidates.length <= 1) return;
    choicePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [candidates]);

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
          : `${formatTemperature(tempC, unit)} · Natural Earth reference (U.S. state)`;
      toast.success(`${place.name} added`, {
        description,
      });
    },
    onError: (e: Error) => {
      if (isCancelledError(e)) return;
      toast.error(e.message ?? "Could not add country");
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (raw: string) => {
      const q = raw.trim();
      await queryClient.cancelQueries({
        predicate: (query) => query.queryKey[0] === "place-search",
      });
      return queryClient.fetchQuery({
        queryKey: ["place-search", q] as const,
        queryFn: ({ signal }) => fetchPlaceSearch(q, signal),
        staleTime: SEARCH_STALE_MS,
        gcTime: 30 * 60_000,
      });
    },
    onSuccess: (results, raw) => {
      const phrase = raw.trim();
      setQuery("");
      if (results.length === 0) {
        setCandidates(null);
        setChoiceMatchPhrase("");
        toast.message("No matches — try another spelling.");
        return;
      }
      if (results.length === 1) {
        setCandidates(null);
        setChoiceMatchPhrase("");
        addCountry.mutate(results[0]);
        return;
      }
      setChoiceMatchPhrase(phrase);
      setCandidates(results);
    },
    onError: (e: Error) => {
      if (isCancelledError(e)) return;
      setCandidates(null);
      setChoiceMatchPhrase("");
      toast.error(e.message ?? "Search failed");
    },
  });

  const busy = searchMutation.isPending || addCountry.isPending;

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim() || busy) return;
      searchMutation.mutate(query);
    },
    [query, busy, searchMutation],
  );

  const pickCandidate = useCallback(
    (c: PlaceSearchResult) => {
      setCandidates(null);
      setChoiceMatchPhrase("");
      setQuery("");
      addCountry.mutate(c);
    },
    [addCountry],
  );

  const handleRemovePlace = useCallback(
    (place: SelectedCountry) => {
      removeCountry(place.id);
      toast.message(`${place.name} removed`);
    },
    [removeCountry],
  );

  const handleClearAll = useCallback(() => {
    clearAll();
    toast.message("Cleared all places.");
  }, [clearAll]);

  return (
    <Card className="border-border/60 bg-card/92 flex h-full max-h-full min-h-0 w-full max-w-md flex-col gap-0 overflow-hidden py-2 shadow-xl ring-1 ring-black/10 backdrop-blur-md sm:gap-0 sm:py-4 sm:shadow-2xl dark:ring-white/10">
      <CardHeader className="shrink-0 px-2.5 pb-2 sm:px-4 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-heading text-card-foreground min-w-0 flex-1 text-xl tracking-tight sm:text-3xl">
            Warmth Atlas
          </CardTitle>
          <div className="shrink-0 pt-0.5">
            <ThemeToggle />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-2.5 sm:gap-5 sm:px-4">
        <form
          onSubmit={onSubmit}
          className="max-lg:order-1 shrink-0 space-y-1.5 sm:space-y-3 lg:order-1"
        >
          <Label htmlFor="country-q" className="text-xs font-medium sm:text-sm">
            Country or U.S. state
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Input
              id="country-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Japan, Texas, Kenya…"
              autoComplete="off"
              disabled={busy}
              inputMode="search"
              enterKeyHint="search"
              className="min-h-10 flex-1 text-base sm:h-11 sm:min-h-0"
            />
            <Button
              type="submit"
              size="lg"
              disabled={busy || !query.trim()}
              className="min-h-10 w-full shrink-0 gap-1.5 px-3 text-sm touch-manipulation sm:min-h-11 sm:w-auto sm:px-5 sm:text-base"
            >
              {busy ? <Loader2 className="size-4 shrink-0 animate-spin" /> : <Plus className="size-4 shrink-0" />}
              Add
            </Button>
          </div>
        </form>

        {candidates && candidates.length > 1 ? (
          <div
            ref={choicePanelRef}
            role="region"
            aria-labelledby="country-choice-heading"
            aria-live="polite"
            className="border-border/80 bg-muted/35 max-lg:order-2 shrink-0 space-y-3 rounded-lg border p-3 sm:space-y-3.5 sm:p-3.5 lg:order-3"
          >
            <div className="flex gap-2.5 sm:gap-3">
              <div
                className="bg-background/80 text-muted-foreground flex size-9 shrink-0 items-center justify-center self-start rounded-lg border border-border/60 sm:size-10"
                aria-hidden
              >
                <ListChecks className="size-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p
                  id="country-choice-heading"
                  className="text-foreground text-base font-semibold leading-snug sm:text-[1.05rem]"
                >
                  Choose a place from the list
                </p>
                <p className="text-muted-foreground text-sm leading-snug sm:text-[0.9375rem]">
                  Several places matched &quot;{choiceMatchPhrase}&quot; — tap a row below to add it.
                </p>
              </div>
            </div>
            <ScrollArea className="bg-background max-h-36 rounded-md border border-border/70 pr-1 sm:max-h-48 sm:pr-2">
              <ul className="space-y-0.5 p-1 sm:p-1.5">
                {candidates.map((c) => (
                  <li key={`${c.kind}-${c.id}`}>
                    <Button
                      type="button"
                      variant="ghost"
                      className="hover:bg-muted/80 flex min-h-10 w-full touch-manipulation items-center gap-2 rounded-md py-2 text-left sm:min-h-9 sm:py-1.5"
                      onClick={() => pickCandidate(c)}
                      disabled={busy}
                    >
                      <PlaceFlagImg candidate={c} className="!size-6 shrink-0 sm:!size-7" />
                      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          {c.kind === "country" ? (
                            <>
                              {c.iso2} · {c.capital}
                            </>
                          ) : (
                            <>U.S. state · {c.id}</>
                          )}
                        </span>
                      </span>
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        ) : null}

        <div className="max-lg:order-3 flex min-h-0 flex-1 flex-col lg:order-4">
          <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
            <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase sm:text-xs">
              On the map ({countries.length})
            </span>
            {countries.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive min-h-9 touch-manipulation gap-1 px-2 text-xs sm:h-8 sm:min-h-0 sm:text-sm"
                onClick={handleClearAll}
              >
                <X className="size-3.5 shrink-0" />
                Clear all
              </Button>
            ) : null}
          </div>

          {countries.length === 0 ? (
            <p className="text-muted-foreground shrink-0 rounded-lg border border-dashed border-border/50 p-2.5 text-xs leading-relaxed sm:p-4 sm:text-sm">
              Nothing selected yet. Add a country or U.S. state to paint it by temperature and fly the globe there.
            </p>
          ) : (
            <ScrollArea className="min-h-0 flex-1 pr-1.5 sm:h-[min(40vh,320px)] sm:flex-none sm:pr-3 lg:min-h-48">
              <ul className="space-y-2 pb-1">
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
          )}
        </div>

        <div className="max-lg:order-4 mt-auto shrink-0 space-y-1.5 pt-1 sm:mt-0 sm:space-y-2 sm:pt-0 lg:order-2">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Display
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              variant={tempDisplayUnit === "C" ? "default" : "secondary"}
              className="h-7 min-w-9 touch-manipulation px-2.5 text-xs font-semibold tabular-nums sm:h-8 sm:min-w-10 sm:text-sm"
              onClick={() => setTempDisplayUnit("C")}
              aria-pressed={tempDisplayUnit === "C"}
            >
              °C
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tempDisplayUnit === "F" ? "default" : "secondary"}
              className="h-7 min-w-9 touch-manipulation px-2.5 text-xs font-semibold tabular-nums sm:h-8 sm:min-w-10 sm:text-sm"
              onClick={() => setTempDisplayUnit("F")}
              aria-pressed={tempDisplayUnit === "F"}
            >
              °F
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-border/60 shrink-0 flex flex-col gap-2.5 border-t px-2.5 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
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
        <p className="text-muted-foreground text-center text-[10px] leading-snug sm:text-left sm:text-xs">
          Temperatures from Open-Meteo (current). Natural Earth: country and U.S. state boundaries. Country names:
          REST Countries.
        </p>
      </CardFooter>
    </Card>
  );
}
