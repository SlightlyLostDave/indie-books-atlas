import type { ReactNode } from "react";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { linkClass } from "@/lib/styles";

/**
 * An address with nothing behind it, set as a short gazetteer entry inside
 * the page shell rather than the centred error template: a marginal note,
 * the head, a sentence under the plate rule, and the ways on. Used by the
 * store not-found page and the site-wide one.
 */
export default function NoEntry({
  crumb,
  title,
  children,
  primary,
}: {
  crumb: string;
  title: string;
  children: ReactNode;
  primary: { href: string; label: string };
}) {
  return (
    <PageShell crumbs={[{ label: crumb }]}>
      <main className="mx-auto w-full max-w-5xl flex-1 px-(--gutter) pt-10 pb-16 md:pt-16">
        <article className="grid gap-x-12 lg:grid-cols-[9rem_minmax(0,1fr)]">
          <p className="font-display text-ui text-ink-quiet italic lg:pt-4">
            No entry <span className="font-mono not-italic">404</span>
          </p>
          <div className="max-w-2xl">
            <h1 className="mt-1 font-display text-page font-bold text-balance text-ink lg:mt-0">{title}</h1>
            <div className="mt-5 border-t-2 border-ink pt-4 text-prose text-ink-dim">{children}</div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href={primary.href} className={buttonVariants({ variant: "default" })}>
                {primary.label}
              </Link>
              {primary.href !== "/" && (
                <Link href="/" className={`${linkClass} text-ui`}>
                  ← Back to Plate 1
                </Link>
              )}
            </div>
          </div>
        </article>
      </main>
    </PageShell>
  );
}
