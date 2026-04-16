import { create } from "zustand";

import {
  colorFromTempCelsius,
  outlineColorFromTempCelsius,
} from "@/lib/warmth/colorFromTemp";

/** One tracked country on the map (unique `iso2`). */
export type SelectedCountry = {
  iso2: string;
  iso3: string;
  name: string;
  capital: string;
  lat: number;
  lon: number;
  /** Canonical stored value for warmth mapping */
  tempC: number;
  warmthFill: string;
  warmthOutline: string;
};

type CountryStore = {
  countries: SelectedCountry[];
  /** Add or replace by ISO2; recompute warmth from temperature. */
  upsertCountry: (input: Omit<SelectedCountry, "warmthFill" | "warmthOutline">) => void;
  removeCountry: (iso2: string) => void;
  clearAll: () => void;
};

function withWarmth(
  input: Omit<SelectedCountry, "warmthFill" | "warmthOutline">,
): SelectedCountry {
  return {
    ...input,
    warmthFill: colorFromTempCelsius(input.tempC),
    warmthOutline: outlineColorFromTempCelsius(input.tempC),
  };
}

export const useCountryStore = create<CountryStore>((set) => ({
  countries: [],
  upsertCountry: (input) =>
    set((state) => {
      const next = withWarmth(input);
      const without = state.countries.filter(
        (c) => c.iso2.toUpperCase() !== next.iso2.toUpperCase(),
      );
      return { countries: [...without, next] };
    }),
  removeCountry: (iso2) =>
    set((state) => ({
      countries: state.countries.filter(
        (c) => c.iso2.toUpperCase() !== iso2.toUpperCase(),
      ),
    })),
  clearAll: () => set({ countries: [] }),
}));
