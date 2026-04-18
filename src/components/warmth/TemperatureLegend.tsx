"use client";

import { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useCountryStore } from "@/lib/store/country-store";
import { isAccessibleWarmthMode } from "@/lib/warmth/display-mode";
import {
  formatTemperature,
  warmthLegendGradientCss,
  WARMTH_SCALE_MAX_C,
  WARMTH_SCALE_MIN_C,
} from "@/lib/warmth/colorFromTemp";
import { cn } from "@/lib/utils";

/**
 * Compact warmth strip: gradient bar carries color; numbers stay small and neutral.
 * In accessible mode, numerals are stronger and the bar adds a diagonal stripe texture
 * so the scale is not conveyed by hue alone.
 */
export function TemperatureLegend() {
  const tempDisplayUnit = useCountryStore((s) => s.tempDisplayUnit);
  const warmthDisplayMode = useCountryStore((s) => s.warmthDisplayMode);
  const accessible = isAccessibleWarmthMode(warmthDisplayMode);

  const gradient = useMemo(() => warmthLegendGradientCss("to top"), []);
  const midC = (WARMTH_SCALE_MIN_C + WARMTH_SCALE_MAX_C) / 2;

  const title = accessible
    ? `Temperature scale (°${tempDisplayUnit}). Numbers are the main cue; color and stripes are a secondary guide—the same range as on the globe.`
    : `Color thermometer (°${tempDisplayUnit}). Colors match how warm or cool the air is at each place—the same scale as the countries on the globe.`;

  const ariaLabel = accessible
    ? `Temperature scale in degrees ${tempDisplayUnit}, cold at the bottom and hot at the top; diagonal stripes add a non-color cue.`
    : `Color scale for temperature on the map, in degrees ${tempDisplayUnit}`;

  return (
    <Card
      title={title}
      className="border-primary/15 bg-card/95 pointer-events-none absolute right-2 bottom-[max(4.25rem,calc(env(safe-area-inset-bottom,0px)+3.25rem))] z-10 max-w-[calc(100vw-1rem)] scale-[0.92] gap-0 rounded-xl py-0 shadow-md ring-1 ring-primary/15 backdrop-blur-md sm:right-4 sm:bottom-6 sm:scale-100 sm:shadow-lg dark:ring-primary/25"
      aria-label={ariaLabel}
    >
      <CardContent className="flex items-stretch gap-1.5 px-2 py-1.5 sm:gap-2 sm:px-2.5 sm:py-2">
        <div
          className={cn(
            "flex min-h-22 flex-col justify-between py-0.5 text-right leading-none tabular-nums sm:min-h-28",
            accessible
              ? "text-foreground text-[11px] font-semibold sm:text-sm"
              : "text-muted-foreground text-[9px] sm:text-[11px]",
          )}
        >
          <span>{formatTemperature(WARMTH_SCALE_MAX_C, tempDisplayUnit, 0)}</span>
          <span>{formatTemperature(midC, tempDisplayUnit, 0)}</span>
          <span>{formatTemperature(WARMTH_SCALE_MIN_C, tempDisplayUnit, 0)}</span>
        </div>
        <div
          className={cn(
            "ring-border/60 relative h-24 w-1.5 shrink-0 self-center overflow-hidden rounded-full shadow-inner ring-1 sm:h-28 sm:w-2",
            accessible && "ring-2 ring-foreground/25",
          )}
        >
          <div className="absolute inset-0 rounded-full" style={{ background: gradient }} />
          {accessible ? (
            <>
              <div
                className="pointer-events-none absolute inset-0 rounded-full opacity-45 dark:hidden"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 5px,
                  rgba(15, 23, 42, 0.2) 5px,
                  rgba(15, 23, 42, 0.2) 9px
                )`,
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 hidden rounded-full opacity-40 dark:block"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 5px,
                  rgba(248, 250, 252, 0.18) 5px,
                  rgba(248, 250, 252, 0.18) 9px
                )`,
                }}
                aria-hidden
              />
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
