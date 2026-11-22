import type { Metadata } from "next";
import Link from "next/link";
import DataFreshness from "@/components/layout/DataFreshness";
import Footer from "@/components/layout/Footer";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { getLastSyncedAt } from "@/lib/freshness";
import { getStoreSlugs } from "@/lib/stores";

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

const linkClass = "text-amber underline-offset-4 hover:underline";
const monoLinkClass = "font-mono text-xs uppercase tracking-widest text-amber hover:underline";
const proseClass = "mt-4 leading-relaxed text-ink-dim";
const cardClass = "rounded-md border border-line bg-bg-raised p-6";

const TOTAL_SECTIONS = 5;

function SectionHeading({ id, index, children }: { id: string; index: number; children: React.ReactNode }) {
  return (
    <>
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
        {String(index).padStart(2, "0")} / {String(TOTAL_SECTIONS).padStart(2, "0")}
      </p>
      <h2 id={id} className="mt-2 font-display text-3xl font-bold text-ink">
        {children}
      </h2>
    </>
  );
}

function SourceRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="pt-0.5 font-mono text-xs uppercase tracking-widest text-moss">{label}</dt>
      <dd className="text-sm leading-relaxed text-ink-dim">{children}</dd>
    </div>
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
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
        <Link href="/" className={monoLinkClass}>
          ← Back to the atlas
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        {/* Hero */}
        <header>
          <p className="font-eyebrow text-sm uppercase tracking-[0.2em] text-moss">About the atlas</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
            A field guide to Canada&apos;s independent bookstores
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-dim">
            Indie Books Atlas is a map of every independently owned bookstore in Canada, from the
            big-city shops with readings every week to the one-room used bookstore you only find
            by taking the long way through town. It&apos;s a labour of love, made by one reader,
            and it gets better every time someone points out what it&apos;s missing.
          </p>
          <p className={proseClass}>
            Independent bookstores are some of the best places in any town, and most of them
            don&apos;t have a marketing budget. This atlas is meant to help you find them, whether
            you&apos;re planning a trip or just wondering what&apos;s around the corner.
          </p>

          <div className={`mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${cardClass} py-4`}>
            {storeCount > 0 && (
              <p className="font-mono text-xs uppercase tracking-widest text-amber">
                {storeCount.toLocaleString("en-CA")} {storeCount === 1 ? "store" : "stores"} mapped
              </p>
            )}
            <DataFreshness syncedAt={syncedAt} />
          </div>
        </header>

        <div className="mt-16 flex flex-col gap-16">
          {/* 01: How stores are found */}
          <section aria-labelledby="sources-heading">
            <SectionHeading id="sources-heading" index={1}>
              How stores are found
            </SectionHeading>
            <p className={proseClass}>
              No single list covers every bookstore in the country, so the atlas combines several
              sources. A small data pipeline pulls them together, matches up duplicates, and
              keeps a record of every change it makes.
            </p>

            <dl className={`mt-6 ${cardClass} py-2`}>
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
              <SourceRow label="ALQ · coming">
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

            <div className="mt-8">
              <h3 className="font-display text-xl font-semibold text-ink">
                Why isn&apos;t my favourite store here?
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-ink-dim marker:text-moss">
                <li>
                  <strong className="text-ink">It isn&apos;t independent.</strong> The atlas leaves
                  out chains (Chapters, Indigo, Coles), university and campus bookstores, and
                  religious bookstores. They&apos;re easy enough to find already; this map is for
                  the independents.
                </li>
                <li>
                  <strong className="text-ink">It hasn&apos;t been verified yet.</strong> New
                  stores only appear once a person has checked them (more on that below).
                </li>
                <li>
                  <strong className="text-ink">Nobody&apos;s mapped it yet.</strong> If it&apos;s
                  not on OpenStreetMap or in a booksellers&apos; directory, the atlas can&apos;t see
                  it.{" "}
                  <Link href="/submit" className={linkClass}>
                    Tell us about it
                  </Link>
                  .
                </li>
              </ul>
            </div>
          </section>

          {/* 02: OpenStreetMap */}
          <section aria-labelledby="osm-heading">
            <SectionHeading id="osm-heading" index={2}>
              The OpenStreetMap connection
            </SectionHeading>
            <p className={proseClass}>
              Most of this atlas starts on{" "}
              <ExternalLink href="https://www.openstreetmap.org/">OpenStreetMap</ExternalLink>, a
              free map of the world built by volunteers, a bit like Wikipedia for places. The atlas
              checks it every week. That means the most powerful way to fix the atlas is often to
              fix OpenStreetMap itself.
            </p>

            <div className="mt-6 rounded-md border border-amber-line bg-bg-raised p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-amber">How it flows</p>
              <ol className="mt-4 space-y-3 leading-relaxed text-ink-dim">
                <li>
                  <span className="mr-2 font-mono text-xs text-moss">1.</span>
                  You add or fix a bookshop on OpenStreetMap: its location, hours, phone, website.
                </li>
                <li>
                  <span className="mr-2 font-mono text-xs text-moss">2.</span>
                  The next Monday, the atlas&apos;s sync picks up your change automatically.
                </li>
                <li>
                  <span className="mr-2 font-mono text-xs text-moss">3.</span>
                  Your fix also improves every other app and map built on OpenStreetMap. One edit,
                  many maps.
                </li>
              </ol>
              <p className="mt-4 text-sm leading-relaxed text-ink-dim">
                Tip: bookstores are tagged{" "}
                <code className="rounded bg-bg-step px-1.5 py-0.5 font-mono text-xs text-ink">shop=books</code>
                . Every store page here also has an &ldquo;Improve this listing on
                OpenStreetMap&rdquo; link that opens the editor right where the store is.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                <ExternalLink href="https://wiki.openstreetmap.org/wiki/Beginners%27_guide" className={monoLinkClass}>
                  Beginner&apos;s guide ↗
                </ExternalLink>
                <ExternalLink href="https://learnosm.org/" className={monoLinkClass}>
                  Learn to edit ↗
                </ExternalLink>
                <ExternalLink href="https://www.openstreetmap.org/" className={monoLinkClass}>
                  Open the map ↗
                </ExternalLink>
              </div>
            </div>
          </section>

          {/* 03: Verified + freshness */}
          <section aria-labelledby="verified-heading">
            <SectionHeading id="verified-heading" index={3}>
              What &ldquo;verified&rdquo; means
            </SectionHeading>
            <p className={proseClass}>
              A store is <strong className="text-ink">verified</strong> when a person has checked
              its listing against the store&apos;s own website, a map, or the CIBA directory, and
              confirmed it&apos;s real, open, and independent. Only verified stores appear on the
              map, and no automated sync ever undoes that check.
            </p>
            <p className={proseClass}>After that, the data is kept current on a regular rhythm:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-ink-dim marker:text-moss">
              <li>
                <strong className="text-ink">Every Monday</strong>, the atlas compares itself with
                OpenStreetMap, picking up new stores and changed details.
              </li>
              <li>
                <strong className="text-ink">Once a month</strong>, hours and phone numbers are
                refreshed for stores that have them listed with Google.
              </li>
              <li>
                <strong className="text-ink">When sources disagree</strong>, a person&apos;s edit
                always wins, then the booksellers&apos; directories, then everything else.
              </li>
              <li>
                <strong className="text-ink">Stores are never closed automatically.</strong> If a
                shop vanishes from OpenStreetMap it&apos;s flagged for a person to look into, because
                a missing map entry and a closed store aren&apos;t the same thing.
              </li>
            </ul>
            <DataFreshness syncedAt={syncedAt} className="mt-6" />
          </section>

          {/* 04: How to help */}
          <section aria-labelledby="help-heading">
            <SectionHeading id="help-heading" index={4}>
              How to help
            </SectionHeading>
            <p className={proseClass}>
              The atlas is only as good as the people who notice what&apos;s wrong with it. If
              you spot something, please say so. A person reads every submission.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className={cardClass}>
                <h3 className="font-display text-xl font-semibold text-ink">Fix a listing</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                  Wrong hours, a new address, a store that&apos;s closed? Every store page has a
                  &ldquo;Suggest a correction&rdquo; link. For location fixes, editing
                  OpenStreetMap directly is even better.
                </p>
                <Link href="/" className={`mt-4 inline-block ${monoLinkClass}`}>
                  Find the store →
                </Link>
              </div>
              <div className={cardClass}>
                <h3 className="font-display text-xl font-semibold text-ink">Add a missing store</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                  Know an independent bookstore that isn&apos;t on the map? Send its name and town,
                  and anything else you know. Booksellers, that includes your own shop.
                </p>
                <Link href="/submit" className={`mt-4 inline-block ${monoLinkClass}`}>
                  Suggest a store →
                </Link>
              </div>
            </div>
          </section>

          {/* 05: Who built it */}
          {/* DRAFT: Dave to rewrite in his own words. */}
          <section aria-labelledby="who-heading">
            <SectionHeading id="who-heading" index={5}>
              Who built it
            </SectionHeading>
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
          </section>
        </div>

        <p className="mt-16 border-t border-line pt-6 text-sm leading-relaxed text-ink-faint">
          Location and listing data ©{" "}
          <ExternalLink href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</ExternalLink>,
          available under the ODbL.
        </p>
      </main>

      <Footer />
    </div>
  );
}
