"use client";

import { useMutation } from "@tanstack/react-query";
import { Info, ListChecks, Loader2, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { LearnDialog } from "@/components/education/LearnDialog";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatObservationTime } from "@/lib/format/observation-time";
import { placeSearchResponseSchema, type PlaceSearchResult } from "@/lib/schemas/place";
import { weatherCurrentResponseSchema } from "@/lib/schemas/weather";
import { useCountryStore } from "@/lib/store/country-store";
import { formatTemperature } from "@/lib/warmth/colorFromTemp";

async function fetchSearch(q: string): Promise<PlaceSearchResult[]> {
  const res = await fetch(`/api/countries/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.error === "string" ? err.error : "Search failed");
  }
  const json: unknown = await res.json();
  const parsed = placeSearchResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Unexpected search response");
  }
  return parsed.data.results;
}

async function fetchWeather(
  lat: number,
  lon: number,
): Promise<{ temperatureC: number; observedAt: string | null }> {
  const res = await fetch(
    `/api/weather/current?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.error === "string" ? err.error : "Weather failed");
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

/**
 * Search, disambiguation list, unit toggle, and stacked country rows with remove/clear.
 */
export function CountryPanel() {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<PlaceSearchResult[] | null>(null);
  const choicePanelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!candidates || candidates.length <= 1) return;
    choicePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [candidates]);

  const countries = useCountryStore((s) => s.countries);
  const tempDisplayUnit = useCountryStore((s) => s.tempDisplayUnit);
  const setTempDisplayUnit = useCountryStore((s) => s.setTempDisplayUnit);
  const upsertCountry = useCountryStore((s) => s.upsertCountry);
  const removeCountry = useCountryStore((s) => s.removeCountry);
  const clearAll = useCountryStore((s) => s.clearAll);

  const addCountry = useMutation({
    mutationFn: async (place: PlaceSearchResult) => {
      const { temperatureC, observedAt } = await fetchWeather(place.lat, place.lon);
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
      toast.error(e.message ?? "Could not add country");
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (raw: string) => fetchSearch(raw.trim()),
    onSuccess: (results) => {
      if (results.length === 0) {
        setCandidates(null);
        toast.message("No matches — try another spelling.");
        return;
      }
      if (results.length === 1) {
        setCandidates(null);
        addCountry.mutate(results[0]);
        return;
      }
      setCandidates(results);
    },
    onError: (e: Error) => {
      setCandidates(null);
      toast.error(e.message ?? "Search failed");
    },
  });

  const busy = searchMutation.isPending || addCountry.isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || busy) return;
    searchMutation.mutate(query);
  }

  function pickCandidate(c: PlaceSearchResult) {
    setCandidates(null);
    setQuery("");
    addCountry.mutate(c);
  }

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
                  Several places matched &quot;{query.trim()}&quot; — tap a row below to add it.
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
                      className="hover:bg-muted/80 min-h-10 w-full touch-manipulation justify-start rounded-md py-2 text-left sm:min-h-9 sm:py-1.5"
                      onClick={() => pickCandidate(c)}
                      disabled={busy}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs sm:text-sm">
                        {c.kind === "country" ? (
                          <>
                            {c.iso2} · {c.capital}
                          </>
                        ) : (
                          <>U.S. state · {c.id}</>
                        )}
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
                onClick={() => {
                  clearAll();
                  toast.message("Cleared all places.");
                }}
              >
                <X className="size-3.5 shrink-0" />
                Clear all
              </Button>
            ) : null}
          </div>

          {countries.length === 0 ? (
            <p className="text-muted-foreground shrink-0 rounded-lg border border-dashed border-border/50 p-2.5 text-xs leading-relaxed sm:p-4 sm:text-sm">
              Nothing selected yet. Add a country or U.S.
            </p>
          ) : (
            <ScrollArea className="min-h-0 flex-1 pr-1.5 sm:h-[min(40vh,320px)] sm:flex-none sm:pr-3 lg:min-h-48">
              <ul className="space-y-2 pb-1">
                {[...countries].reverse().map((c) => (
                  <li
                    key={c.id}
                    className="border-border/70 flex items-center gap-2 rounded-xl border bg-muted/50 p-2.5 sm:gap-3 sm:p-3 dark:bg-white/5"
                  >
                    <span
                      className="ring-foreground/15 h-9 w-2 shrink-0 self-stretch rounded-full ring-2 sm:h-10 dark:ring-white/20"
                      style={{ background: c.warmthFill }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="truncate text-[15px] font-semibold sm:text-base">{c.name}</span>
                        <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                          {c.kind === "country" ? c.iso2 : c.id}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5 truncate text-xs sm:text-sm">
                        {c.kind === "country"
                          ? `${c.capital} · ${formatTemperature(c.tempC, tempDisplayUnit)}`
                          : `Natural Earth reference · ${formatTemperature(c.tempC, tempDisplayUnit)}`}
                      </p>
                      {c.observedAt ? (
                        <p className="text-muted-foreground/85 mt-0.5 max-w-full truncate text-[10px] sm:text-xs">
                          Observed {formatObservationTime(c.observedAt)}
                          {c.kind === "country" ? " (capital area, Open-Meteo)" : " (NE reference, Open-Meteo)"}
                        </p>
                      ) : null}
                    </div>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground size-9 shrink-0 touch-manipulation sm:size-8"
                            aria-label={`Data details for ${c.name}`}
                          >
                            <Info className="size-4" />
                          </Button>
                        }
                      />
                      <TooltipContent side="bottom" className="max-w-[min(90vw,22rem)] text-left text-xs leading-relaxed">
                        <p className="font-medium">Current air temperature (2 m)</p>
                        <p className="text-muted-foreground mt-1">
                          {c.kind === "country" ? (
                            <>
                              Near {c.capital} coordinates from REST Countries. Source: Open-Meteo (current).
                            </>
                          ) : (
                            <>
                              Natural Earth reference coordinates for this U.S. state (not the legislative
                              capital). Source: Open-Meteo (current).
                            </>
                          )}
                          {c.observedAt ? (
                            <> Timestamp: {formatObservationTime(c.observedAt)}.</>
                          ) : (
                            <> Observation time not returned for this request.</>
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive size-11 shrink-0 touch-manipulation sm:size-9"
                      onClick={() => {
                        removeCountry(c.id);
                        toast.message(`${c.name} removed`);
                      }}
                      aria-label={`Remove ${c.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>

        <div className="max-lg:order-4 mt-auto shrink-0 space-y-1.5 pt-1 sm:mt-0 sm:space-y-2 sm:pt-0 lg:order-2">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Display
          </span>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
            <Button
              type="button"
              variant={tempDisplayUnit === "C" ? "default" : "secondary"}
              className="min-h-10 flex-1 text-sm touch-manipulation sm:h-9 sm:min-h-0 sm:text-base"
              onClick={() => setTempDisplayUnit("C")}
              aria-pressed={tempDisplayUnit === "C"}
            >
              °C
            </Button>
            <Button
              type="button"
              variant={tempDisplayUnit === "F" ? "default" : "secondary"}
              className="min-h-10 flex-1 text-sm touch-manipulation sm:h-9 sm:min-h-0 sm:text-base"
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
