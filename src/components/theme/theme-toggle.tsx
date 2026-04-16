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
        className="bg-muted/80 size-8 animate-pulse rounded-lg border border-border/60 sm:size-9"
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
        size="icon"
        variant={appearance === "light" ? "default" : "ghost"}
        className={cn(
          "size-8 rounded-md sm:size-9",
          appearance !== "light" && "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => setTheme("light")}
        aria-pressed={appearance === "light"}
        aria-label="Light theme"
        title="Light theme"
      >
        <Sun className="size-4 shrink-0 sm:size-[1.125rem]" aria-hidden />
      </Button>
      <Button
        type="button"
        size="icon"
        variant={appearance === "dark" ? "default" : "ghost"}
        className={cn(
          "size-8 rounded-md sm:size-9",
          appearance !== "dark" && "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => setTheme("dark")}
        aria-pressed={appearance === "dark"}
        aria-label="Dark theme"
        title="Dark theme"
      >
        <Moon className="size-4 shrink-0 sm:size-[1.125rem]" aria-hidden />
      </Button>
    </div>
  );
}
