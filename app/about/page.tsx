import type { Metadata } from "next";
import Link from "next/link";
import DataFreshness from "@/components/layout/DataFreshness";
import EditionLine from "@/components/layout/EditionLine";
import PageShell from "@/components/layout/PageShell";
import { getLastSyncedAt } from "@/lib/freshness";
import { getStoreSlugs } from "@/lib/stores";
import { linkClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

// Matches the freshness fetch's cache window.
export const revalidate = 21600;

const title = "About the atlas";
const description =
  "How Indie Books Atlas finds Canada's independent bookstores, what “verified” means, how often the data is checked, and how you can help.";

export const metadata: Metadata = {
  title: `${title} | Indie Books Atlas`,
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "/about",
    siteName: "Indie Books Atlas",
    title,
    description,
    locale: "en_CA",
  },
};

const proseClass = "mt-4 text-prose text-ink-dim";
const strong = "font-medium text-ink";

/**
 * One note on the compilation: a marginal label in Playfair italic beside a
 * Playfair head, as an atlas's notes are set. Under 1024px the label sits
 * above the head.
 */
function Note({
  id,
  index,
  heading,
  children,
}: {
  id: string;
  index: number;
  heading: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-x-12 border-t border-ink-faint pt-5 lg:grid-cols-[9rem_minmax(0,1fr)]"
    >
      <p className="font-display text-ui text-ink-faint italic lg:pt-1.5">
        Note <span className="lining-nums">{index}</span>
      </p>
      <div className="min-w-0">
        <h2 id={id} className="mt-1 font-display text-heading font-semibold text-ink lg:mt-0">
          {heading}
        </h2>
        {children}
      </div>
    </section>
  );
}

function SourceRow({ label, planned, children }: { label: string; planned?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-line py-3.5 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-6">
      <dt className="font-display text-prose text-ink italic">
        {label}
        {planned && <span className="text-ink-faint"> · {planned}</span>}
      </dt>
      <dd className="text-body text-ink-dim">{children}</dd>
    </div>
  );
}

/** A list with the atlas's moss square bullet instead of a disc. */
function SquareList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul
      className={cn(
        "mt-3 space-y-2.5 text-prose text-ink-dim",
        "[&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:top-[0.7em] [&>li]:before:left-0.5 [&>li]:before:size-1.5 [&>li]:before:bg-moss",
        className,
      )}
    >
      {children}
    </ul>
  );
}

function ExternalLink({ href, className = linkClass, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export default async function AboutPage() {
  const [syncedAt, slugs] = await Promise.all([getLastSyncedAt(), getStoreSlugs()]);
  const storeCount = slugs.length;

  return (
    <PageShell crumbs={[{ label: "About the atlas" }]}>
      <main className="mx-auto w-full max-w-5xl flex-1 px-(--gutter) pt-10 pb-16 md:pt-16">
        {/* Title page */}
        <header className="grid gap-x-12 lg:grid-cols-[9rem_minmax(0,1fr)]">
          <p className="font-display text-ui text-ink-faint italic lg:pt-4">About the atlas</p>
          <div className="min-w-0">
            <h1 className="mt-1 font-display text-page font-bold text-balance text-ink lg:mt-0">
              A field guide to Canada&apos;s independent bookstores
            </h1>
            <p className="mt-6 max-w-[42rem] text-lede text-ink-dim">
              Indie Books Atlas is a map of every independently owned bookstore in Canada, from the
              big-city shops with readings every week to the one-room used bookstore you only find
              by taking the long way through town. It&apos;s a labour of love, made by one reader,
              and it gets better every time someone points out what it&apos;s missing.
            </p>
            <p className={cn(proseClass, "max-w-[42rem]")}>
              Independent bookstores are some of the best places in any town, and most of them
              don&apos;t have a marketing budget. This atlas is meant to help you find them, whether
              you&apos;re planning a trip or just wondering what&apos;s around the corner.
            </p>

            {storeCount > 0 ? (
              <EditionLine
                className="mt-10"
                imprint="Notes on the compilation"
                count={storeCount}
                countLabel="recorded"
                syncedAt={syncedAt}
              />
            ) : (
              <DataFreshness syncedAt={syncedAt} className="mt-10 text-meta" />
            )}
          </div>
        </header>

        <div className="mt-16 flex flex-col gap-16">
          <Note id="sources-heading" index={1} heading="How stores are found">
            <p className={proseClass}>
              No single list covers every bookstore in the country, so the atlas combines several
              sources. A small data pipeline pulls them together, matches up duplicates, and
              keeps a record of every change it makes.
            </p>

            <dl className="mt-6 border-t border-ink-faint">
              <SourceRow label="OpenStreetMap">
                The backbone. Every place in Canada tagged as a bookshop on OpenStreetMap, the
                free map anyone can edit. It&apos;s the best source for where a store is and
                whether it exists at all.
              </SourceRow>
              <SourceRow label="CIBA">
                The{" "}
                <ExternalLink href="https://www.ciba.ca/">
                  Canadian Independent Booksellers Association
                </ExternalLink>{" "}
                member directory. It&apos;s curated by booksellers themselves, so it&apos;s trusted
                above most other sources.
              </SourceRow>
              <SourceRow label="ALQ" planned="coming">
                The Association des libraires du Québec directory, for Quebec&apos;s
                francophone stores. It&apos;s being added next.
              </SourceRow>
              <SourceRow label="Wikidata">
                A supplementary source that sometimes fills small gaps.
              </SourceRow>
              <SourceRow label="Google Places">
                Used only to keep hours and phone numbers current for stores already on the
                map, never to add new stores.
              </SourceRow>
              <SourceRow label="You">
                Readers and booksellers who tell us what&apos;s missing or out of date. A person
                reads every submission before it changes anything.
              </SourceRow>
            </dl>

            <h3 className="mt-10 font-display text-lede font-semibold text-ink">
              Why isn&apos;t my favourite store here?
            </h3>
            <SquareList>
              <li>
                <strong className={strong}>It isn&apos;t independent.</strong> The atlas leaves
                out chains (Chapters, Indigo, Coles), university and campus bookstores, and
                religious bookstores. They&apos;re easy enough to find already; this map is for
                the independents.
              </li>
              <li>
                <strong className={strong}>It hasn&apos;t been verified yet.</strong> New
                stores only appear once a person has checked them (more on that below).
              </li>
              <li>
                <strong className={strong}>Nobody&apos;s mapped it yet.</strong> If it&apos;s
                not on OpenStreetMap or in a booksellers&apos; directory, the atlas can&apos;t see
                it.{" "}
                <Link href="/submit" className={linkClass}>
                  Tell us about it
                </Link>
                .
              </li>
            </SquareList>
          </Note>

          <Note id="osm-heading" index={2} heading="The OpenStreetMap connection">
            <p className={proseClass}>
              Most of this atlas starts on{" "}
              <ExternalLink href="https://www.openstreetmap.org/">OpenStreetMap</ExternalLink>, a
              free map of the world built by volunteers, a bit like Wikipedia for places. The atlas
              checks it every week. That means the most powerful way to fix the atlas is often to
              fix OpenStreetMap itself.
            </p>

            <h3 className="mt-8 font-display text-prose text-ink-dim italic">How it flows</h3>
            <ol className="mt-3 border-t border-line">
              {[
                <>You add or fix a bookshop on OpenStreetMap: its location, hours, phone, website.</>,
                <>The next Monday, the atlas&apos;s sync picks up your change automatically.</>,
                <>
                  Your fix also improves every other app and map built on OpenStreetMap. One edit,
                  many maps.
                </>,
              ].map((step, i) => (
                <li key={i} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline border-b border-line py-3">
                  <span aria-hidden="true" className="font-display text-heading font-bold text-moss lining-nums">
                    {i + 1}
                  </span>
                  <span className="text-prose text-ink-dim">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-body text-ink-dim">
              Tip: bookstores are tagged{" "}
              <code className="bg-bg-step px-1.5 py-0.5 font-mono text-meta text-ink">shop=books</code>
              . Every store page here also has an &ldquo;Improve this listing on
              OpenStreetMap&rdquo; link that opens the editor right where the store is.
            </p>
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-ui">
              <ExternalLink href="https://wiki.openstreetmap.org/wiki/Beginners%27_guide">
                Beginner&apos;s guide ↗
              </ExternalLink>
              <ExternalLink href="https://learnosm.org/">Learn to edit ↗</ExternalLink>
              <ExternalLink href="https://www.openstreetmap.org/">Open the map ↗</ExternalLink>
            </p>
          </Note>

          <Note id="verified-heading" index={3} heading={<>What &ldquo;verified&rdquo; means</>}>
            <p className={proseClass}>
              A store is <strong className={strong}>verified</strong> when a person has checked
              its listing against the store&apos;s own website, a map, or the CIBA directory, and
              confirmed it&apos;s real, open, and independent. Only verified stores appear on the
              map, and no automated sync ever undoes that check.
            </p>
            <p className={proseClass}>After that, the data is kept current on a regular rhythm:</p>
            <SquareList>
              <li>
                <strong className={strong}>Every Monday</strong>, the atlas compares itself with
                OpenStreetMap, picking up new stores and changed details.
              </li>
              <li>
                <strong className={strong}>Once a month</strong>, hours and phone numbers are
                refreshed for stores that have them listed with Google.
              </li>
              <li>
                <strong className={strong}>When sources disagree</strong>, a person&apos;s edit
                always wins, then the booksellers&apos; directories, then everything else.
              </li>
              <li>
                <strong className={strong}>Stores are never closed automatically.</strong> If a
                shop vanishes from OpenStreetMap it&apos;s flagged for a person to look into, because
                a missing map entry and a closed store aren&apos;t the same thing.
              </li>
            </SquareList>
            <DataFreshness syncedAt={syncedAt} className="mt-6 text-ui" />
          </Note>

          <Note id="help-heading" index={4} heading="How to help">
            <p className={proseClass}>
              The atlas is only as good as the people who notice what&apos;s wrong with it. If
              you spot something, please say so. A person reads every submission.
            </p>
            <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              <div className="border-t-2 border-ink pt-3">
                <h3 className="font-display text-lede font-semibold text-ink">Fix a listing</h3>
                <p className="mt-2 text-body text-ink-dim">
                  Wrong hours, a new address, a store that&apos;s closed? Every store page has a
                  &ldquo;Suggest a correction&rdquo; link. For location fixes, editing
                  OpenStreetMap directly is even better.
                </p>
                <Link href="/" className={cn(linkClass, "mt-3 inline-block text-ui")}>
                  Find the store →
                </Link>
              </div>
              <div className="border-t-2 border-ink pt-3">
                <h3 className="font-display text-lede font-semibold text-ink">Add a missing store</h3>
                <p className="mt-2 text-body text-ink-dim">
                  Know an independent bookstore that isn&apos;t on the map? Send its name and town,
                  and anything else you know. Booksellers, that includes your own shop.
                </p>
                <Link href="/submit" className={cn(linkClass, "mt-3 inline-block text-ui")}>
                  Suggest a store →
                </Link>
              </div>
            </div>
          </Note>

          {/* DRAFT: Dave to rewrite in his own words. */}
          <Note id="who-heading" index={5} heading="Who built it">
            <p className={proseClass}>
              Hi, I&apos;m{" "}
              <ExternalLink href="https://davebeach.me">Dave Beach</ExternalLink>. I make maps, and
              I can&apos;t walk past a bookstore without going in. Every new town I visit starts the
              same way: looking for the local indie shop. Finding them was always harder than it
              should be, so I started building the map I wanted.
            </p>
            <p className={proseClass}>
              This is an evenings-and-weekends project, not a company. The code that gathers the
              data is{" "}
              <ExternalLink href="https://github.com/SlightlyLostDave/indie-books-atlas-pipeline">
                open on GitHub
              </ExternalLink>
              . If you have an idea, a correction, or just a favourite bookstore you want to tell
              someone about, I&apos;d love to hear it.
            </p>
          </Note>
        </div>

        {/* Colophon */}
        <section
          aria-labelledby="colophon-heading"
          className="mt-16 grid gap-x-12 border-t-2 border-ink pt-4 lg:grid-cols-[9rem_minmax(0,1fr)]"
        >
          <h2 id="colophon-heading" className="font-display text-ui text-ink-faint italic">
            Colophon
          </h2>
          <div className="mt-1 space-y-1.5 text-ui text-ink-dim lg:mt-0">
            <p>
              Location and listing data ©{" "}
              <ExternalLink href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</ExternalLink>,
              available under the ODbL.
            </p>
            <p>Set in Playfair Display, Jost and IBM Plex Mono.</p>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
