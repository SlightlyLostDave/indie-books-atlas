"use client";

import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { linkClass } from "@/lib/styles";

/**
 * A public page that failed to render, set as a short entry in the page
 * shell (DESIGN.md, States: never the centred error template). The error's
 * message is never shown: in production it's a generic string anyway. The
 * digest is, so a report can be matched to the server logs.
 */
export default function ErrorEntry({ digest, retry }: { digest?: string; retry: () => void }) {
  return (
    <PageShell crumbs={[{ label: "Didn't load" }]}>
      <main className="mx-auto w-full max-w-5xl flex-1 px-(--gutter) pt-10 pb-16 md:pt-16">
        <article className="grid gap-x-12 lg:grid-cols-[9rem_minmax(0,1fr)]">
          <p className="font-display text-ui text-ink-quiet italic lg:pt-4">Didn&apos;t load</p>
          <div className="max-w-2xl">
            <h1 className="mt-1 font-display text-page font-bold text-balance text-ink lg:mt-0">
              This page didn&apos;t load
            </h1>
            <p className="mt-5 border-t-2 border-ink pt-4 text-prose text-ink-dim">
              The atlas couldn&apos;t read its records just now. Nothing on your side caused it, and trying again
              usually works. No store has been removed.
            </p>
            {digest && (
              <p className="mt-3 text-meta text-ink-dim">
                If it keeps happening, this reference matches it to the logs:{" "}
                <span className="font-mono text-ink">{digest}</span>
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button onClick={() => retry()}>Try again</Button>
              <Link href="/" className={`${linkClass} text-ui`}>
                ← Back to Plate 1
              </Link>
            </div>
          </div>
        </article>
      </main>
    </PageShell>
  );
}
