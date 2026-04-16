"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

type Props = {
  children: ReactNode;
};

/**
 * App-wide TanStack Query client (one per browser session).
 */
export function AppProviders({ children }: Props) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delay={200}>
        <OfflineBanner />
        {children}
      </TooltipProvider>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
