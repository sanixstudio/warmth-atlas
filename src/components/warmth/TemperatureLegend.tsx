"use client";

import { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useCountryStore } from "@/lib/store/country-store";
import {
  formatTemperature,
  warmthLegendGradientCss,
  WARMTH_SCALE_MAX_C,
  WARMTH_SCALE_MIN_C,
} from "@/lib/warmth/colorFromTemp";

/**
 * Compact warmth strip: gradient bar carries color; numbers stay small and neutral.
 * Hover the card for a longer explanation (native `title`).
 */
export function TemperatureLegend() {
  const tempDisplayUnit = useCountryStore((s) => s.tempDisplayUnit);
  const gradient = useMemo(() => warmthLegendGradientCss("to top"), []);
  const midC = (WARMTH_SCALE_MIN_C + WARMTH_SCALE_MAX_C) / 2;

  return (
    <Card
      title={`Color thermometer (°${tempDisplayUnit}). Colors match how warm or cool the air is at each place—the same scale as the countries on the globe.`}
      className="border-primary/15 bg-card/95 pointer-events-none absolute right-2 bottom-[max(4.25rem,calc(env(safe-area-inset-bottom,0px)+3.25rem))] z-10 max-w-[calc(100vw-1rem)] scale-[0.92] gap-0 rounded-xl py-0 shadow-md ring-1 ring-primary/15 backdrop-blur-md sm:right-4 sm:bottom-6 sm:scale-100 sm:shadow-lg dark:ring-primary/25"
      aria-label={`Color scale for temperature on the map, in degrees ${tempDisplayUnit}`}
    >
      <CardContent className="flex items-stretch gap-1.5 px-2 py-1.5 sm:gap-2 sm:px-2.5 sm:py-2">
        <div className="text-muted-foreground flex min-h-22 flex-col justify-between py-0.5 text-right text-[9px] leading-none tabular-nums sm:min-h-28 sm:text-[11px]">
          <span>{formatTemperature(WARMTH_SCALE_MAX_C, tempDisplayUnit, 0)}</span>
          <span>{formatTemperature(midC, tempDisplayUnit, 0)}</span>
          <span>{formatTemperature(WARMTH_SCALE_MIN_C, tempDisplayUnit, 0)}</span>
        </div>
        <div
          className="ring-border/60 h-24 w-1.5 shrink-0 self-center rounded-full shadow-inner ring-1 sm:h-28 sm:w-2"
          style={{ background: gradient }}
        />
      </CardContent>
    </Card>
  );
}
