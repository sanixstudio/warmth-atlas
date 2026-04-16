import { create } from "zustand";

import {
  colorFromTempCelsius,
  outlineColorFromTempCelsius,
  type TemperatureDisplayUnit,
} from "@/lib/warmth/colorFromTemp";

/**
 * One tracked map entry: sovereign country or U.S. state / D.C. Unique by `id`
 * (ISO2 for countries, ISO-3166-2 `US-XX` for states).
 */
export type SelectedCountry = {
  id: string;
  kind: "country" | "us_state";
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

export const useCountryStore = create<CountryStore>((set) => ({
  countries: [],
  tempDisplayUnit: "F",
  setTempDisplayUnit: (unit) => set({ tempDisplayUnit: unit }),
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
}));
