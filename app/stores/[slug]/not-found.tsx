import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { linkClass } from "@/lib/styles";

/**
 * A missing store, set as a short gazetteer entry inside the page shell
 * rather than the centred error template: a marginal note, the head, a
 * sentence, and the two ways on.
 */
export default function StoreNotFound() {
  return (
    <PageShell crumbs={[{ label: "Not in the atlas" }]}>
      <main className="mx-auto w-full max-w-5xl flex-1 px-(--gutter) pt-10 pb-16 md:pt-16">
        <article className="grid gap-x-12 lg:grid-cols-[9rem_minmax(0,1fr)]">
          <p className="font-display text-ui text-ink-faint italic lg:pt-4">
            No entry <span className="font-mono not-italic">404</span>
          </p>
          <div className="max-w-2xl">
            <h1 className="mt-1 font-display text-page font-bold text-balance text-ink lg:mt-0">
              We couldn&apos;t find that bookstore
            </h1>
            <p className="mt-5 border-t-2 border-ink pt-4 text-prose text-ink-dim">
              It may have moved, closed, or not been verified yet. If you know a store that belongs
              here, tell us about it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/submit" className={buttonVariants({ variant: "default" })}>
                Suggest a store
              </Link>
              <Link href="/" className={`${linkClass} text-ui`}>
                ← Back to the atlas
              </Link>
            </div>
          </div>
        </article>
      </main>
    </PageShell>
  );
}
