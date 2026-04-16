"use client";

import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCountryStore } from "@/lib/store/country-store";
import {
  formatTemperature,
  warmthLegendGradientCss,
  WARMTH_SCALE_MAX_C,
  WARMTH_SCALE_MIN_C,
} from "@/lib/warmth/colorFromTemp";

/**
 * Floating scale for country fill colors (same palette as map). Sits on the map so it stays
 * visible; `pointer-events-none` keeps pan/zoom usable through the card.
 * Compact on small screens so the map stays primary.
 */
export function TemperatureLegend() {
  const tempDisplayUnit = useCountryStore((s) => s.tempDisplayUnit);
  const gradient = useMemo(() => warmthLegendGradientCss("to top"), []);
  const midC = (WARMTH_SCALE_MIN_C + WARMTH_SCALE_MAX_C) / 2;

  return (
    <Card
      className="border-border/60 bg-card/90 pointer-events-none absolute right-2 bottom-[max(4.25rem,calc(env(safe-area-inset-bottom,0px)+3.25rem))] z-10 w-23 max-w-[calc(100vw-1rem)] scale-[0.92] shadow-lg ring-1 ring-black/10 backdrop-blur-md sm:right-4 sm:bottom-6 sm:w-38 sm:max-w-none sm:scale-100 sm:shadow-xl dark:ring-white/10"
      aria-label="Warmth scale: temperature color scale for country fill"
    >
      <CardHeader className="hidden gap-0.5 px-4 pb-2 pt-4 text-left sm:block sm:gap-1">
        <CardTitle className="text-muted-foreground font-heading text-[11px] tracking-widest uppercase">
          Warmth scale
        </CardTitle>
        <CardDescription className="text-[10px] leading-snug">
          Air temp at capital (°{tempDisplayUnit}) matches fill color.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-2 px-2 pb-2 pt-2.5 sm:space-y-0 sm:px-4 sm:pb-4 sm:pt-0">
        {/* <p className="text-muted-foreground hidden max-w-44 text-center text-[10px] leading-snug sm:block">
          Colors reinforce temperature; use the number labels if reading color alone is difficult. A numeric-only map
          mode may be added later.
        </p> */}
        <div className="flex w-full items-stretch justify-center gap-1 sm:gap-2.5">
          <div className="text-muted-foreground flex min-h-32 flex-col justify-between py-0.5 text-right text-[8px] leading-none tabular-nums sm:min-h-44 sm:text-[11px]">
            <span>{formatTemperature(WARMTH_SCALE_MAX_C, tempDisplayUnit, 0)}</span>
            <span>{formatTemperature(midC, tempDisplayUnit, 0)}</span>
            <span>{formatTemperature(WARMTH_SCALE_MIN_C, tempDisplayUnit, 0)}</span>
          </div>
          <div
            className="ring-border/80 h-32 w-2 shrink-0 self-center rounded-full shadow-inner ring-1 sm:h-44 sm:w-4"
            style={{ background: gradient }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
