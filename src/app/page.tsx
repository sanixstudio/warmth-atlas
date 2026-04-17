import { GlobeMapLoader } from "@/components/globe/GlobeMapLoader";
import { CountryPanel } from "@/components/warmth/CountryPanel";
import { TemperatureLegend } from "@/components/warmth/TemperatureLegend";

/**
 * Full-viewport warmth explorer: panel + Mapbox GL client map.
 */
export default function Home() {
  return (
    <div className="bg-background flex h-dvh min-h-0 flex-col overflow-hidden lg:flex-row">
      <aside className="border-border/50 from-primary/[0.07] via-background to-accent/[0.12] relative z-20 flex w-full min-h-0 shrink-0 flex-col overflow-y-auto overscroll-contain border-b bg-gradient-to-b p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-4 max-lg:max-h-[min(58svh,560px)] lg:h-dvh lg:max-h-none lg:w-[min(100%,420px)] lg:border-r lg:border-b-0 dark:from-primary/[0.12] dark:via-background dark:to-accent/[0.06]">
        <CountryPanel />
      </aside>
      <div className="bg-muted relative min-h-0 flex-1">
        <GlobeMapLoader />
        <TemperatureLegend />
      </div>
    </div>
  );
}
