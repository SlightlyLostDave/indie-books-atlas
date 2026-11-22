import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { PlateMark } from "@/components/ui/icons";

export interface Crumb {
  label: string;
  /** Omit for the current page or for a place that has no page of its own. */
  href?: string;
}

interface PageShellProps {
  /** Breadcrumb after "Plate 1". The last crumb is the current page. */
  crumbs?: Crumb[];
  children: ReactNode;
}

const quietLink =
  "text-ink-dim no-underline transition-colors duration-(--dur-quick) hover:text-moss";

/**
 * The shared frame for content routes (/stores/[slug], /about, /submit and
 * the store not-found page), so they read as pages of the same atlas: a
 * running head over a neatline, the page, then the colophon.
 *
 * The way back to the map is the breadcrumb's first entry, the plate mark
 * and "Plate 1", just as a gazetteer entry refers back to its plate.
 */
export default function PageShell({ crumbs = [], children }: PageShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-ink-faint">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-(--gutter) py-3">
          <Link
            href="/"
            className="shrink-0 font-display text-[1.0625rem] leading-tight font-bold text-ink no-underline md:text-[1.125rem]"
          >
            Indie Books Atlas
          </Link>

          <nav
            aria-label="Breadcrumb"
            className="order-last w-full min-w-0 md:order-none md:w-auto md:flex-1"
          >
            <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-ui text-ink-faint">
              <li className="flex items-center">
                <Link
                  href="/"
                  className={`inline-flex items-center gap-1.5 ${quietLink}`}
                  title="Back to the map"
                >
                  <PlateMark className="size-4" />
                  Plate 1
                </Link>
              </li>
              {crumbs.map((crumb, i) => {
                const isCurrent = i === crumbs.length - 1;
                return (
                  <li key={`${i}-${crumb.label}`} className="flex min-w-0 items-center gap-1.5">
                    <span aria-hidden="true">›</span>
                    {crumb.href && !isCurrent ? (
                      <Link href={crumb.href} className={`truncate ${quietLink}`}>
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isCurrent ? "page" : undefined}
                        className={isCurrent ? "truncate text-ink" : "truncate text-ink-dim"}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex shrink-0 items-center gap-5 text-ui">
            <Link href="/about" className={`hidden md:inline ${quietLink}`}>
              About
            </Link>
            <Link href="/submit" className={`hidden md:inline ${quietLink}`}>
              Suggest a store
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      <Footer />
    </div>
  );
}
