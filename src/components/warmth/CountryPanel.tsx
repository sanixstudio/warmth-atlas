"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import type { CountrySearchResult } from "@/lib/schemas/country";
import { countrySearchResponseSchema } from "@/lib/schemas/country";
import { weatherCurrentResponseSchema } from "@/lib/schemas/weather";
import { useCountryStore } from "@/lib/store/country-store";
import { formatTemperature } from "@/lib/warmth/colorFromTemp";

async function fetchSearch(q: string): Promise<CountrySearchResult[]> {
  const res = await fetch(`/api/countries/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.error === "string" ? err.error : "Search failed");
  }
  const json: unknown = await res.json();
  const parsed = countrySearchResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Unexpected search response");
  }
  return parsed.data.results;
}

async function fetchWeather(lat: number, lon: number): Promise<number> {
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
  return parsed.data.temperatureC;
}

/**
 * Search, disambiguation list, unit toggle, and stacked country rows with remove/clear.
 */
export function CountryPanel() {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<CountrySearchResult[] | null>(null);

  const countries = useCountryStore((s) => s.countries);
  const tempDisplayUnit = useCountryStore((s) => s.tempDisplayUnit);
  const setTempDisplayUnit = useCountryStore((s) => s.setTempDisplayUnit);
  const upsertCountry = useCountryStore((s) => s.upsertCountry);
  const removeCountry = useCountryStore((s) => s.removeCountry);
  const clearAll = useCountryStore((s) => s.clearAll);

  const addCountry = useMutation({
    mutationFn: async (country: CountrySearchResult) => {
      const tempC = await fetchWeather(country.lat, country.lon);
      return { country, tempC };
    },
    onSuccess: ({ country, tempC }) => {
      upsertCountry({
        iso2: country.iso2,
        iso3: country.iso3,
        name: country.name,
        capital: country.capital,
        lat: country.lat,
        lon: country.lon,
        tempC,
      });
      const unit = useCountryStore.getState().tempDisplayUnit;
      toast.success(`${country.name} added`, {
        description: `Near ${country.capital}: ${formatTemperature(tempC, unit)}`,
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
        toast.message("No countries matched — try another spelling.");
        return;
      }
      if (results.length === 1) {
        setCandidates(null);
        addCountry.mutate(results[0]);
        return;
      }
      setCandidates(results);
      toast.message("Several matches — pick one below.");
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

  function pickCandidate(c: CountrySearchResult) {
    setCandidates(null);
    setQuery("");
    addCountry.mutate(c);
  }

  return (
    <Card className="border-border/60 bg-card/92 flex h-full max-h-full min-h-0 w-full max-w-md flex-col gap-0 overflow-hidden py-2 shadow-xl ring-1 ring-white/10 backdrop-blur-md sm:gap-0 sm:py-4 sm:shadow-2xl">
      <CardHeader className="shrink-0 space-y-0.5 px-2.5 pb-2 sm:space-y-1 sm:px-4 sm:pb-4">
        <CardTitle className="font-heading text-primary-foreground text-xl tracking-tight sm:text-3xl">
          Warmth Atlas
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs leading-snug sm:line-clamp-none sm:text-base sm:leading-relaxed">
          Live air temperature at each capital, colored on the globe — add countries to compare.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-2.5 sm:gap-5 sm:px-4">
        <form
          onSubmit={onSubmit}
          className="max-lg:order-1 shrink-0 space-y-1.5 sm:space-y-3 lg:order-1"
        >
          <Label htmlFor="country-q" className="text-xs font-medium sm:text-sm">
            Country name
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Input
              id="country-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Japan, Brazil, Kenya…"
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
          <div className="max-lg:order-2 shrink-0 space-y-2 lg:order-3">
            <p className="text-muted-foreground text-sm font-medium">Which one?</p>
            <ScrollArea className="max-h-32 rounded-lg border pr-1 sm:max-h-44 sm:pr-2">
              <ul className="space-y-1 p-1">
                {candidates.map((c) => (
                  <li key={`${c.iso2}-${c.name}`}>
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-10 w-full touch-manipulation justify-start py-2.5 text-left sm:min-h-0 sm:py-2"
                      onClick={() => pickCandidate(c)}
                      disabled={busy}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {c.iso2} · {c.capital}
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
                  toast.message("Cleared all countries.");
                }}
              >
                <X className="size-3.5 shrink-0" />
                Clear all
              </Button>
            ) : null}
          </div>

          {countries.length === 0 ? (
            <p className="text-muted-foreground shrink-0 rounded-lg border border-dashed border-border/50 p-2.5 text-xs leading-relaxed sm:p-4 sm:text-sm">
              Nothing selected yet. Add a country to paint it by temperature and fly the globe there.
            </p>
          ) : (
            <ScrollArea className="min-h-0 flex-1 pr-1.5 sm:h-[min(40vh,320px)] sm:flex-none sm:pr-3 lg:min-h-48">
              <ul className="space-y-2 pb-1">
                {[...countries].reverse().map((c) => (
                  <li
                    key={c.iso2}
                    className="border-border/70 flex items-center gap-2 rounded-xl border bg-white/5 p-2.5 sm:gap-3 sm:p-3"
                  >
                    <span
                      className="h-9 w-2 shrink-0 self-stretch rounded-full ring-2 ring-white/20 sm:h-10"
                      style={{ background: c.warmthFill }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="truncate text-[15px] font-semibold sm:text-base">{c.name}</span>
                        <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                          {c.iso2}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5 truncate text-xs sm:text-sm">
                        {c.capital} · {formatTemperature(c.tempC, tempDisplayUnit)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive size-11 shrink-0 touch-manipulation sm:size-9"
                      onClick={() => {
                        removeCountry(c.iso2);
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

      <CardFooter className="text-muted-foreground hidden shrink-0 border-t px-4 py-3 text-xs leading-snug sm:block">
        Temperatures from Open-Meteo (current). Boundaries: Natural Earth. Country data: REST Countries.
      </CardFooter>
    </Card>
  );
}
