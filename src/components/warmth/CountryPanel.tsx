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
    <Card className="border-border/60 bg-card/92 w-full max-w-md shadow-2xl ring-1 ring-white/10 backdrop-blur-md sm:max-w-md">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-heading text-primary-foreground text-3xl tracking-tight">
          Warmth Atlas
        </CardTitle>
        <CardDescription className="text-base leading-relaxed">
          Add countries and compare live air temperature at each capital — layered on a 3D globe.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={onSubmit} className="space-y-3">
          <Label htmlFor="country-q" className="text-sm font-medium">
            Country name
          </Label>
          <div className="flex gap-2">
            <Input
              id="country-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Japan, Brazil, Kenya…"
              autoComplete="off"
              disabled={busy}
              className="h-11 flex-1 text-base"
            />
            <Button type="submit" size="lg" disabled={busy || !query.trim()} className="shrink-0 gap-1.5">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Display
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={tempDisplayUnit === "C" ? "default" : "secondary"}
              size="sm"
              className="flex-1"
              onClick={() => setTempDisplayUnit("C")}
            >
              °C
            </Button>
            <Button
              type="button"
              variant={tempDisplayUnit === "F" ? "default" : "secondary"}
              size="sm"
              className="flex-1"
              onClick={() => setTempDisplayUnit("F")}
            >
              °F
            </Button>
          </div>
        </div>

        {candidates && candidates.length > 1 ? (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">Which one?</p>
            <ScrollArea className="max-h-44 rounded-lg border pr-2">
              <ul className="space-y-1 p-1">
                {candidates.map((c) => (
                  <li key={`${c.iso2}-${c.name}`}>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto w-full justify-start py-2 text-left"
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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              On the map ({countries.length})
            </span>
            {countries.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive h-8 gap-1"
                onClick={() => {
                  clearAll();
                  toast.message("Cleared all countries.");
                }}
              >
                <X className="size-3.5" />
                Clear all
              </Button>
            ) : null}
          </div>

          {countries.length === 0 ? (
            <p className="text-muted-foreground border-border/50 rounded-lg border border-dashed p-4 text-sm">
              Nothing selected yet. Add a country to paint it by temperature and fly the globe there.
            </p>
          ) : (
            <ScrollArea className="h-[min(40vh,320px)] pr-3">
              <ul className="space-y-2 pb-1">
                {[...countries].reverse().map((c) => (
                  <li
                    key={c.iso2}
                    className="border-border/70 flex items-center gap-3 rounded-xl border bg-white/5 p-3"
                  >
                    <span
                      className="h-10 w-2 shrink-0 rounded-full ring-2 ring-white/20"
                      style={{ background: c.warmthFill }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold">{c.name}</span>
                        <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                          {c.iso2}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground truncate text-xs">
                        {c.capital} · {formatTemperature(c.tempC, tempDisplayUnit)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive shrink-0"
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
      </CardContent>

      <CardFooter className="text-muted-foreground border-t pt-4 text-xs leading-snug">
        Temperatures from Open-Meteo (current). Boundaries: Natural Earth. Country data: REST Countries.
      </CardFooter>
    </Card>
  );
}
