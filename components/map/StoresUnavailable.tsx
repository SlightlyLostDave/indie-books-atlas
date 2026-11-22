"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditionLine from "@/components/layout/EditionLine";
import { Button } from "@/components/ui/button";
import { LoadingIcon } from "@/components/ui/icons";
import { linkClass } from "@/lib/styles";

/**
 * The index panel when the store layer didn't load (AUDIT F-STATE-3). The
 * basemap still draws, so the plate must not read as an empty atlas: the
 * panel says the stores failed to load, offers a retry (a server refresh,
 * which re-runs the query), and the plate's legend line says "stores not
 * loaded" instead of a zero.
 */
export default function StoresUnavailable({ lastSyncedAt }: { lastSyncedAt: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [attempts, setAttempts] = useState(0);

  function retry() {
    setAttempts((n) => n + 1);
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="font-display text-ui text-ink-quiet italic">Plate 1 is missing its stores</p>
      <h2
        data-panel-focus
        tabIndex={-1}
        className="mt-1 font-display text-title font-bold text-balance text-ink outline-offset-4"
      >
        The stores didn&rsquo;t load
      </h2>
      <p className="mt-3 border-t-2 border-ink pt-3 text-body text-ink-dim">
        The map is drawn, but its layer of bookstores didn&rsquo;t come through from the database. This is a
        failed load, not an empty atlas: no store has been removed.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button onClick={retry} disabled={isPending}>
          {isPending ? "Trying again…" : "Try again"}
        </Button>
        <p role="status" aria-live="polite" className="text-ui text-ink-dim">
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <LoadingIcon className="size-4 text-moss" />
              <span className="font-display italic">Asking the database again…</span>
            </span>
          ) : attempts > 0 ? (
            <span className="font-display italic">Still not loaded. It&rsquo;s usually back within a few minutes.</span>
          ) : null}
        </p>
      </div>

      <p className="mt-8 text-ui text-ink-dim">
        Store pages may still open from a search engine or a saved link, and{" "}
        <Link href="/about" className={linkClass}>
          how the atlas is made
        </Link>{" "}
        doesn&rsquo;t depend on the database.
      </p>

      <div className="mt-auto pt-10">
        <EditionLine imprint="Plate 1" count={null} countLabel="mapped" syncedAt={lastSyncedAt} />
      </div>
    </div>
  );
}
