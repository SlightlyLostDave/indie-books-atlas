"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { linkClass } from "@/lib/styles";

/**
 * A failed admin page, set as a short entry inside the office shell rather
 * than a red box (DESIGN.md, Do and don't). The server's message isn't put
 * on the page; in production Next replaces it with a digest anyway, so the
 * digest is shown for matching the server logs, and the message is kept
 * behind a disclosure for development.
 */
export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <article className="grid max-w-4xl gap-x-10 gap-y-2 lg:grid-cols-[8rem_minmax(0,1fr)]">
      <p className="font-display text-ui text-ink-faint italic lg:pt-2">Didn&apos;t load</p>
      <div className="min-w-0 max-w-[38rem]">
        <h1 className="font-display text-title font-bold text-ink">This page couldn&apos;t be read</h1>
        <p className="mt-3 border-t-2 border-ink pt-3 text-body text-ink-dim">
          The data behind it didn&apos;t load. Nothing was changed. Try again, and if it keeps failing, check the
          server logs.
        </p>
        {error.digest && (
          <p className="mt-2 text-meta text-ink-dim">
            Reference for the logs: <span className="font-mono text-ink">{error.digest}</span>
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button onClick={() => retry()}>Try again</Button>
          <Link href="/admin" className={`${linkClass} text-ui`}>
            ← Back to the dashboard
          </Link>
        </div>
        {error.message && (
          <details className="mt-8 border-t border-line pt-3 text-meta text-ink-dim">
            <summary className="cursor-pointer text-ui text-ink-dim hover:text-ink">Technical detail</summary>
            <p className="mt-2 font-mono break-words text-ink-dim">{error.message}</p>
          </details>
        )}
      </div>
    </article>
  );
}
