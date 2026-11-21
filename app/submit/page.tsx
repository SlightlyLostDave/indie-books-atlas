import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SearchParams = Awaited<PageProps<"/submit">["searchParams"]>;

/** First value of a query param, trimmed and length-capped. */
function readParam(params: SearchParams, key: string, max: number): string | null {
  const raw = params[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value ? value.slice(0, max) : null;
}

function readStoreContext(params: SearchParams) {
  const slug = readParam(params, "store", 200);
  const id = readParam(params, "id", 64);
  const name = readParam(params, "name", 200);
  return slug && id ? { slug, id, name: name ?? slug } : null;
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/submit">): Promise<Metadata> {
  const store = readStoreContext(await searchParams);
  return {
    title: store
      ? `Suggest a correction for ${store.name} | Indie Books Atlas`
      : "Suggest a correction or add a store | Indie Books Atlas",
    description: "Help keep the Indie Books Atlas accurate: send a correction or tell us about a store.",
    alternates: { canonical: "/submit" },
    // Pre-filled variants are per-store duplicates of the same form.
    robots: store ? { index: false, follow: true } : undefined,
  };
}

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default async function SubmitPage({ searchParams }: PageProps<"/submit">) {
  const store = readStoreContext(await searchParams);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
        <Link
          href={store ? `/stores/${encodeURIComponent(store.slug)}` : "/"}
          className="font-mono text-xs uppercase tracking-widest text-amber hover:underline"
        >
          {store ? `← Back to ${store.name}` : "← Back to the atlas"}
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <p className="font-eyebrow text-sm uppercase tracking-[0.2em] text-moss">Contribute</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">
          {store ? "Suggest a correction" : "Suggest a correction or a store"}
        </h1>
        {store ? (
          <p className="mt-4 leading-relaxed text-ink-dim">
            Suggesting a correction for <strong className="text-ink">{store.name}</strong>. Tell
            us what&apos;s wrong or missing; every submission is reviewed by a person before it
            changes the atlas.
          </p>
        ) : (
          <p className="mt-4 leading-relaxed text-ink-dim">
            Spotted something out of date, or know an indie bookstore we&apos;re missing? Every
            submission is reviewed by a person before it changes the atlas.
          </p>
        )}

        {/* TODO: wire a server action that inserts into `submissions` once its
            columns are confirmed (not yet documented in docs/SUPABASE_SCHEMA.md). */}
        <form className="mt-10 rounded-md border border-line bg-bg-raised p-6">
          {store && (
            <>
              <input type="hidden" name="store_id" value={store.id} />
              <input type="hidden" name="store_slug" value={store.slug} />
            </>
          )}

          <FieldGroup>
            {store && (
              <Field>
                <FieldLabel htmlFor="store_name">Store</FieldLabel>
                <FieldContent>
                  <Input id="store_name" name="store_name" defaultValue={store.name} readOnly />
                </FieldContent>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="submission_type">What kind of change?</FieldLabel>
              <FieldContent>
                <select
                  id="submission_type"
                  name="submission_type"
                  defaultValue={store ? "correction" : "new_store"}
                  className={selectClass}
                >
                  <option value="correction">Correct a detail (hours, phone, address…)</option>
                  <option value="closed">This store has closed</option>
                  <option value="new_store">Add a store that&apos;s missing</option>
                </select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="details">Details</FieldLabel>
              <FieldContent>
                <Textarea
                  id="details"
                  name="details"
                  rows={6}
                  required
                  placeholder={
                    store
                      ? "e.g. They're now open until 8 pm on Thursdays."
                      : "Store name, city, and anything else you know."
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Your email (optional)</FieldLabel>
              <FieldContent>
                <Input id="email" name="email" type="email" autoComplete="email" />
                <FieldDescription>Only used if we need to follow up.</FieldDescription>
              </FieldContent>
            </Field>

            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" disabled>
                Send suggestion
              </Button>
              <span className="font-mono text-xs uppercase tracking-widest text-ink-faint">
                Submissions open soon
              </span>
            </div>
          </FieldGroup>
        </form>
      </main>

      <Footer />
    </div>
  );
}
