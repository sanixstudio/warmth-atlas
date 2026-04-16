import { GlobeMapLoader } from "@/components/globe/GlobeMapLoader";
import { CountryPanel } from "@/components/warmth/CountryPanel";

/**
 * Full-viewport warmth explorer: panel + Mapbox GL client map.
 */
export default function Home() {
  return (
    <div className="bg-background flex h-svh min-h-0 flex-col overflow-hidden lg:flex-row">
      <aside className="border-border/50 relative z-20 flex w-full shrink-0 flex-col border-b p-4 lg:h-svh lg:w-[min(100%,420px)] lg:border-r lg:border-b-0">
        <CountryPanel />
      </aside>
      <div className="bg-muted relative min-h-[45vh] flex-1 lg:min-h-0">
        <GlobeMapLoader />
      </div>
    </div>
  );
}
