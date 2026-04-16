import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Warmth Atlas — Globe country temperatures",
  description:
    "Compare current air temperatures at country capitals on an interactive Mapbox globe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${dmSans.variable} h-full antialiased`}>
      <body className={`${dmSans.className} min-h-0 flex flex-col font-sans`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
