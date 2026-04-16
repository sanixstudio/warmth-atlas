"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** SSR is false; after hydration on the client, true — no effect/setState (see React `useSyncExternalStore` pattern). */
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Light / Dark only (no “System” control). Default app behavior still follows the OS until the user chooses here.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsClient();

  const appearance = resolvedTheme === "light" ? "light" : "dark";

  if (!mounted) {
    return (
      <div
        className="bg-muted/80 h-8 w-27 animate-pulse rounded-lg border border-border/60 sm:h-9 sm:w-30"
        aria-hidden
      />
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className="bg-muted/60 flex items-center gap-0.5 rounded-lg border border-border/70 p-0.5 shadow-sm"
    >
      <Button
        type="button"
        size="sm"
        variant={appearance === "light" ? "default" : "ghost"}
        className={cn(
          "h-7 min-w-0 flex-1 gap-1 rounded-md px-2 text-[11px] font-medium sm:h-8 sm:px-2.5 sm:text-xs",
          appearance !== "light" && "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => setTheme("light")}
        aria-pressed={appearance === "light"}
        title="Light theme"
      >
        <Sun className="size-3.5 shrink-0 sm:size-4" aria-hidden />
        <span>Light</span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant={appearance === "dark" ? "default" : "ghost"}
        className={cn(
          "h-7 min-w-0 flex-1 gap-1 rounded-md px-2 text-[11px] font-medium sm:h-8 sm:px-2.5 sm:text-xs",
          appearance !== "dark" && "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => setTheme("dark")}
        aria-pressed={appearance === "dark"}
        title="Dark theme"
      >
        <Moon className="size-3.5 shrink-0 sm:size-4" aria-hidden />
        <span>Dark</span>
      </Button>
    </div>
  );
}
