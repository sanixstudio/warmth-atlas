"use client";

import { Info, Trash2 } from "lucide-react";
import { memo, useCallback } from "react";

import { PlaceFlagImg } from "@/components/warmth/PlaceFlagImg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatObservationTime } from "@/lib/format/observation-time";
import type { SelectedCountry } from "@/lib/store/country-store";
import type { TemperatureDisplayUnit } from "@/lib/warmth/colorFromTemp";
import { formatTemperature } from "@/lib/warmth/colorFromTemp";

export type SelectedPlaceRowProps = {
  place: SelectedCountry;
  tempDisplayUnit: TemperatureDisplayUnit;
  onRemove: (place: SelectedCountry) => void;
};

/**
 * One selected place in the sidebar: flag, warmth strip, labels, info tooltip, remove.
 * Below `lg`, layout compresses to a short card so the list scrolls without covering °C/°F controls.
 */
export const SelectedPlaceRow = memo(function SelectedPlaceRow({
  place,
  tempDisplayUnit,
  onRemove,
}: SelectedPlaceRowProps) {
  const handleRemove = useCallback(() => {
    onRemove(place);
  }, [onRemove, place]);

  const tempLabel = formatTemperature(place.tempC, tempDisplayUnit);
  const subtitleCountry = `${place.iso2} · ${place.capital}`;

  return (
    <li className="border-border/70 flex items-stretch gap-2 rounded-xl border bg-muted/50 p-2 dark:bg-white/5 lg:items-center lg:gap-3 lg:rounded-2xl lg:p-3">
      <PlaceFlagImg place={place} className="size-6! shrink-0 self-center lg:size-8!" />
      <span
        className="ring-foreground/15 w-1.5 shrink-0 self-stretch rounded-full ring-2 max-lg:min-h-10 lg:h-10 dark:ring-white/20"
        style={{ background: place.warmthFill }}
        aria-hidden
      />

      {/* Compact: narrow sidebar / phones */}
      <div className="min-w-0 flex-1 lg:hidden">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold leading-tight">{place.name}</span>
          <span className="text-primary shrink-0 text-sm font-bold tabular-nums">{tempLabel}</span>
        </div>
        <p className="text-muted-foreground mt-0.5 truncate text-[11px] leading-tight">
          {place.kind === "country" ? subtitleCountry : `U.S. state · ${place.id}`}
        </p>
      </div>

      {/* Spacious: desktop sidebar */}
      <div className="hidden min-w-0 flex-1 py-0.5 lg:block">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="truncate text-[15px] font-semibold sm:text-base">{place.name}</span>
          <Badge variant="secondary" className="font-mono text-[10px] uppercase">
            {place.kind === "country" ? place.iso2 : place.id}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-0.5 truncate text-xs sm:text-sm">
          {place.kind === "country"
            ? `${place.capital} · ${tempLabel}`
            : `Natural Earth reference · ${tempLabel}`}
        </p>
        {place.observedAt ? (
          <p className="text-muted-foreground/85 mt-0.5 max-w-full truncate text-[10px] sm:text-xs">
            Observed {formatObservationTime(place.observedAt)}
            {place.kind === "country" ? " (capital area, Open-Meteo)" : " (NE reference, Open-Meteo)"}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-row items-center gap-0.5 self-center">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground size-8 touch-manipulation lg:size-8"
                aria-label={`Data details for ${place.name}`}
              >
                <Info className="size-3.5 lg:size-4" />
              </Button>
            }
          />
          <TooltipContent side="bottom" className="max-w-[min(90vw,22rem)] text-left text-xs leading-relaxed">
            <p className="font-medium">Current air temperature (2 m)</p>
            <p className="text-muted-foreground mt-1">
              {place.kind === "country" ? (
                <>
                  Near {place.capital} coordinates from REST Countries. Source: Open-Meteo (current).
                </>
              ) : (
                <>
                  Natural Earth reference coordinates for this U.S. state (not the legislative capital). Source:
                  Open-Meteo (current).
                </>
              )}
              {place.observedAt ? (
                <> Timestamp: {formatObservationTime(place.observedAt)}.</>
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
          className="text-muted-foreground hover:text-destructive size-8 touch-manipulation lg:size-9"
          onClick={handleRemove}
          aria-label={`Remove ${place.name}`}
        >
          <Trash2 className="size-3.5 lg:size-4" />
        </Button>
      </div>
    </li>
  );
});
