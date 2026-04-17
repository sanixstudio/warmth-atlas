"use client";

import { isCancelledError, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListChecks, Loader2, MapPin, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { LearnDialog } from "@/components/education/LearnDialog";
import { PlaceFlagImg } from "@/components/warmth/PlaceFlagImg";
import { SelectedPlaceRow } from "@/components/warmth/SelectedPlaceRow";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchCurrentWeather, fetchPlaceSearch } from "@/lib/api/warmth-client";
import { APP_TAGLINE } from "@/lib/product/education-content";
import type { PlaceSearchResult } from "@/lib/schemas/place";
import type { SelectedCountry } from "@/lib/store/country-store";
import { useCountryStore } from "@/lib/store/country-store";
import { formatTemperature } from "@/lib/warmth/colorFromTemp";

const SEARCH_STALE_MS = 10 * 60_000;
const WEATHER_STALE_MS = 2 * 60_000;

/**
 * Search, disambiguation list, unit toggle, and stacked country rows with remove/clear.
 * Copy and touch targets lean toward ages ~9–16: concrete labels, encouragement, ~44px+ actions (NN/g, BBC GEL).
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
      toast.success(`Nice — ${place.name} is on the map!`, {
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
        toast.message("No matches yet — try different spelling or a shorter name.");
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
      toast.message(`${place.name} is off your map.`);
    },
    [removeCountry],
  );

  const handleClearAll = useCallback(() => {
    clearAll();
    toast.message("Map cleared. Add a new place whenever you like.");
  }, [clearAll]);

  return (
    <Card className="border-border/60 bg-card/95 flex h-full max-h-full min-h-0 w-full max-w-md flex-col gap-0 overflow-hidden rounded-2xl py-2 shadow-xl ring-1 ring-primary/10 backdrop-blur-md max-lg:h-full sm:gap-0 sm:py-4 sm:shadow-2xl dark:ring-primary/20">
      <CardHeader className="max-lg:space-y-1.5 max-lg:pb-1.5 shrink-0 space-y-2 px-2.5 pb-2 sm:space-y-2.5 sm:px-4 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <CardTitle className="font-heading text-card-foreground text-2xl leading-tight tracking-tight sm:text-3xl">
              Warmth Atlas
            </CardTitle>
            <CardDescription className="text-muted-foreground hidden max-w-prose text-sm leading-snug sm:text-[0.9375rem] lg:block">
              {APP_TAGLINE}
            </CardDescription>
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

      <CardContent className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-2.5 max-lg:gap-2 sm:gap-5 sm:px-4">
        <form
          onSubmit={onSubmit}
          className="max-lg:order-1 shrink-0 space-y-2 sm:space-y-3 lg:order-1"
        >
          <Label htmlFor="country-q" className="text-foreground text-sm font-semibold sm:text-base">
            Where do you want to explore?
          </Label>
          <p className="text-muted-foreground -mt-0.5 hidden text-xs leading-snug lg:block lg:text-sm">
            Type a country or a U.S. state, then add it to paint the map.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Input
              id="country-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Japan, Texas, Kenya…"
              autoComplete="off"
              disabled={busy}
              inputMode="search"
              enterKeyHint="search"
              className="border-primary/15 focus-visible:ring-primary/40 min-h-11 flex-1 rounded-xl text-base sm:h-12 sm:min-h-0"
            />
            <Button
              type="submit"
              size="lg"
              disabled={busy || !query.trim()}
              className="min-h-11 w-full shrink-0 gap-2 rounded-xl px-4 text-base font-semibold shadow-md touch-manipulation sm:min-h-12 sm:w-auto sm:px-6"
            >
              {busy ? (
                <Loader2 className="size-5 shrink-0 animate-spin" />
              ) : (
                <MapPin className="size-5 shrink-0" aria-hidden />
              )}
              Add to map
            </Button>
          </div>
        </form>

        {candidates && candidates.length > 1 ? (
          <div
            ref={choicePanelRef}
            role="region"
            aria-labelledby="country-choice-heading"
            aria-live="polite"
            className="border-primary/20 from-primary/6 to-accent/8 max-lg:order-2 shrink-0 space-y-3 rounded-2xl border bg-linear-to-br p-3 sm:space-y-3.5 sm:p-4 lg:order-3 dark:border-primary/25 dark:from-primary/10 dark:to-transparent"
          >
            <div className="flex gap-2.5 sm:gap-3">
              <div
                className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center self-start rounded-xl border border-primary/20 sm:size-11"
                aria-hidden
              >
                <ListChecks className="size-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p
                  id="country-choice-heading"
                  className="text-foreground text-base font-bold leading-snug sm:text-lg"
                >
                  Pick one to explore
                </p>
                <p className="text-muted-foreground text-sm leading-snug sm:text-[0.9375rem]">
                  More than one place matched &quot;{choiceMatchPhrase}&quot;. Tap the row you meant—we will fly the
                  globe there.
                </p>
              </div>
            </div>
            <ScrollArea className="bg-background/90 max-h-36 rounded-xl border border-border/70 pr-1 sm:max-h-48 sm:pr-2">
              <ul className="space-y-0.5 p-1 sm:p-1.5">
                {candidates.map((c) => (
                  <li key={`${c.kind}-${c.id}`}>
                    <Button
                      type="button"
                      variant="ghost"
                      className="hover:bg-primary/8 flex min-h-11 w-full touch-manipulation items-center gap-2 rounded-xl py-2 text-left sm:min-h-12 sm:py-2.5"
                      onClick={() => pickCandidate(c)}
                      disabled={busy}
                    >
                      <PlaceFlagImg candidate={c} className="size-6! shrink-0 sm:size-7!" />
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
            <div className="border-primary/15 from-muted/40 to-accent/12 text-muted-foreground shrink-0 space-y-2 rounded-2xl border border-dashed bg-linear-to-br p-3 sm:space-y-2.5 sm:p-4">
              <div className="text-primary flex items-center gap-2 text-sm font-semibold sm:text-base">
                <Sparkles className="size-4 shrink-0 sm:size-5" aria-hidden />
                Start your tour
              </div>
              <p className="text-xs leading-relaxed sm:text-sm">
                Add any country or U.S. state above. Each place gets a flag, a color from today&apos;s air temperature,
                and a spin on the globe so you can compare the world in one glance.
              </p>
            </div>
          ) : (
            <ScrollArea className="min-h-0 w-full flex-1 pr-1.5 max-lg:min-h-[min(44svh,380px)] lg:min-h-56 lg:max-h-[min(56vh,520px)] lg:pr-3">
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
          <span className="text-foreground text-sm font-semibold">Show temperatures in</span>
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
