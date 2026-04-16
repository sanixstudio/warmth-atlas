import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — Warmth Atlas",
  description: "How Warmth Atlas handles data in the MVP—no accounts, minimal collection, public APIs.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-dvh px-4 py-8 sm:px-8">
      <article className="text-foreground mx-auto max-w-xl space-y-6">
        <p>
          <Link href="/" className="text-primary text-sm font-medium underline-offset-4 hover:underline">
            ← Back to map
          </Link>
        </p>
        <h1 className="font-heading text-3xl tracking-tight">Privacy (MVP)</h1>
        <p className="text-muted-foreground leading-relaxed">
          Warmth Atlas is built so classrooms can try it without creating accounts. In this version we do not run
          sign-up, profile pages, chat, or public feeds.
        </p>
        <ul className="text-muted-foreground list-inside list-disc space-y-2 pl-0.5 text-sm leading-relaxed">
          <li>
            We use your browser to call public APIs (weather, country metadata, map tiles). Those services may log
            requests as any website would; please read their policies if you need district-level detail.
          </li>
          <li>
            Country choices and temperatures you add stay in this browser session (Zustand state). We do not send your
            classroom “list of countries” to our own analytics in this open-source-style MVP—verify your deployment if
            you self-host.
          </li>
          <li>
            If we add accounts or classroom features later, we will publish an updated policy and age-appropriate
            flows before collecting personal information (including attention to COPPA / FERPA in the U.S.).
          </li>
        </ul>
        <p className="text-sm">
          <Link href="/educators" className="text-primary font-medium underline-offset-4 hover:underline">
            Educator overview →
          </Link>
        </p>
      </article>
    </div>
  );
}
