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
 */
export function TemperatureLegend() {
  const tempDisplayUnit = useCountryStore((s) => s.tempDisplayUnit);
  const gradient = useMemo(() => warmthLegendGradientCss("to top"), []);
  const midC = (WARMTH_SCALE_MIN_C + WARMTH_SCALE_MAX_C) / 2;

  return (
    <Card
      className="border-border/60 bg-card/88 pointer-events-none absolute right-3 bottom-16 z-10 w-38 shadow-xl ring-1 ring-white/10 backdrop-blur-md sm:right-4 sm:bottom-6"
      aria-label="Temperature color scale for country fill"
    >
      <CardHeader className="gap-1 pb-2">
        <CardTitle className="text-muted-foreground font-heading text-[11px] tracking-widest uppercase">
          Warmth scale
        </CardTitle>
        <CardDescription className="text-[10px] leading-snug">
          Air temp at capital (°{tempDisplayUnit}) matches fill color.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col items-center justify-center">
        <div className="flex items-stretch justify-end gap-2.5">
          <div className="text-muted-foreground flex min-h-44 flex-col justify-between py-0.5 text-right text-[11px] leading-none tabular-nums">
            <span>{formatTemperature(WARMTH_SCALE_MAX_C, tempDisplayUnit, 0)}</span>
            <span>{formatTemperature(midC, tempDisplayUnit, 0)}</span>
            <span>{formatTemperature(WARMTH_SCALE_MIN_C, tempDisplayUnit, 0)}</span>
          </div>
          <div
            className="ring-border/80 h-44 w-4 shrink-0 rounded-full shadow-inner ring-1"
            style={{ background: gradient }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
