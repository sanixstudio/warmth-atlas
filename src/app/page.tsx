import { GlobeMapLoader } from "@/components/globe/GlobeMapLoader";
import { CountryPanel } from "@/components/warmth/CountryPanel";
import { TemperatureLegend } from "@/components/warmth/TemperatureLegend";

/**
 * Full-viewport warmth explorer: panel + Mapbox GL client map.
 */
export default function Home() {
  return (
    <div className="bg-background flex h-dvh min-h-0 flex-col overflow-hidden lg:flex-row">
      <aside className="border-border/50 relative z-20 flex w-full min-h-0 shrink-0 flex-col overflow-y-auto overscroll-contain border-b p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-4 max-lg:max-h-[min(58svh,560px)] lg:h-dvh lg:max-h-none lg:w-[min(100%,420px)] lg:border-r lg:border-b-0">
        <CountryPanel />
      </aside>
      <div className="bg-muted relative min-h-0 flex-1">
        <GlobeMapLoader />
        <TemperatureLegend />
      </div>
    </div>
  );
}
