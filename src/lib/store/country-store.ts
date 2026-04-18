import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { WarmthDisplayMode } from "@/lib/warmth/display-mode";
import {
  colorFromTempCelsius,
  outlineColorFromTempCelsius,
  type TemperatureDisplayUnit,
} from "@/lib/warmth/colorFromTemp";

/**
 * One tracked map entry: country, U.S. state / D.C., or geocoded city. Unique by `id`
 * (ISO2, `US-XX`, or `city-{Open-Meteo geocode id}`).
 */
export type SelectedCountry = {
  id: string;
  kind: "country" | "us_state" | "city";
  iso2: string;
  iso3: string;
  name: string;
  capital: string;
  lat: number;
  lon: number;
  /** Canonical stored value for warmth mapping */
  tempC: number;
  /** ISO 8601 observation time from weather API when provided */
  observedAt: string | null;
  warmthFill: string;
  warmthOutline: string;
};

type CountryStore = {
  countries: SelectedCountry[];
  /** Panel + legend: how air temperatures are labeled (stored data stays °C). */
  tempDisplayUnit: TemperatureDisplayUnit;
  setTempDisplayUnit: (unit: TemperatureDisplayUnit) => void;
  /** Globe + legend: color-first vs patterns/outlines + stronger numbers. */
  warmthDisplayMode: WarmthDisplayMode;
  setWarmthDisplayMode: (mode: WarmthDisplayMode) => void;
  /** Add or replace by canonical `id`; recompute warmth from temperature. */
  upsertCountry: (
    input: Omit<SelectedCountry, "warmthFill" | "warmthOutline">,
  ) => void;
  removeCountry: (id: string) => void;
  clearAll: () => void;
};

function withWarmth(
  input: Omit<SelectedCountry, "warmthFill" | "warmthOutline">,
): SelectedCountry {
  return {
    ...input,
    observedAt: input.observedAt ?? null,
    warmthFill: colorFromTempCelsius(input.tempC),
    warmthOutline: outlineColorFromTempCelsius(input.tempC),
  };
}

export const useCountryStore = create<CountryStore>()(
  persist(
    (set) => ({
      countries: [],
      tempDisplayUnit: "F",
      warmthDisplayMode: "standard",
      setTempDisplayUnit: (unit) => set({ tempDisplayUnit: unit }),
      setWarmthDisplayMode: (warmthDisplayMode) => set({ warmthDisplayMode }),
      upsertCountry: (input) =>
        set((state) => {
          const next = withWarmth(input);
          const without = state.countries.filter(
            (c) => c.id.toUpperCase() !== next.id.toUpperCase(),
          );
          return { countries: [...without, next] };
        }),
      removeCountry: (id) =>
        set((state) => ({
          countries: state.countries.filter((c) => c.id.toUpperCase() !== id.toUpperCase()),
        })),
      clearAll: () => set({ countries: [] }),
    }),
    {
      name: "fun-map-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tempDisplayUnit: state.tempDisplayUnit,
        warmthDisplayMode: state.warmthDisplayMode,
      }),
    },
  ),
);
