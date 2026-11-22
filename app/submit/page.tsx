import type { Metadata } from "next";
import Link from "next/link";
import PageShell, { type Crumb } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InfoMark } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { linkClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

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

const SUBMISSION_TYPES = [
  { value: "correction", label: "Correct a detail (hours, phone, address…)" },
  { value: "closed", label: "This store has closed" },
  { value: "new_store", label: "Add a store that's missing" },
] as const;

/** A square radio: a hollow square, filled with a moss square when chosen. */
function TypeOption({ value, label, defaultChecked }: { value: string; label: string; defaultChecked: boolean }) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 border-l-2 border-transparent py-1.5 pr-2 pl-2.5 text-body text-ink",
        "transition-colors duration-(--dur-quick) hover:bg-bg-step",
        "has-checked:border-moss has-checked:bg-bg-step has-checked:font-medium",
        "has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-moss",
      )}
    >
      <input type="radio" name="submission_type" value={value} defaultChecked={defaultChecked} className="sr-only" />
      <span
        aria-hidden="true"
        className="grid size-4 shrink-0 place-items-center border border-ink-dim bg-bg transition-colors duration-(--dur-quick) group-hover:border-moss group-has-checked:border-moss"
      >
        <span className="hidden size-2 bg-moss group-has-checked:block" />
      </span>
      {label}
    </label>
  );
}

export default async function SubmitPage({ searchParams }: PageProps<"/submit">) {
  const store = readStoreContext(await searchParams);
  const crumbs: Crumb[] = store
    ? [
        { label: store.name, href: `/stores/${encodeURIComponent(store.slug)}` },
        { label: "Suggest a correction" },
      ]
    : [{ label: "Suggest a correction or a store" }];

  return (
    <PageShell crumbs={crumbs}>
      <main className="mx-auto w-full max-w-3xl flex-1 px-(--gutter) pt-10 pb-16 md:pt-16">
        <p className="font-display text-ui text-ink-quiet italic">Contribute</p>
        <h1 className="mt-1 font-display text-page font-bold text-balance text-ink">
          {store ? "Suggest a correction" : "Suggest a correction or a store"}
        </h1>
        {store ? (
          <p className="mt-5 max-w-[40rem] text-prose text-ink-dim">
            Suggesting a correction for <strong className="font-medium text-ink">{store.name}</strong>. Tell
            us what&apos;s wrong or missing; every submission is reviewed by a person before it
            changes the atlas.
          </p>
        ) : (
          <p className="mt-5 max-w-[40rem] text-prose text-ink-dim">
            Spotted something out of date, or know an indie bookstore we&apos;re missing? Every
            submission is reviewed by a person before it changes the atlas.
          </p>
        )}

        {/* The correction slip. TODO: wire a server action that inserts into
            `submissions` once its columns are confirmed (not yet documented in
            docs/SUPABASE_SCHEMA.md). Until then the form posts nothing: the
            send button is disabled, which also blocks submit-on-Enter. */}
        <form className="mt-10 border border-t-2 border-ink-faint border-t-ink bg-bg-raised" aria-describedby="slip-status">
          {store && (
            <>
              <input type="hidden" name="store_id" value={store.id} />
              <input type="hidden" name="store_slug" value={store.slug} />
            </>
          )}

          {/* Slip head: which entry this is about */}
          <div className="border-b border-ink-faint px-5 py-4 sm:px-6">
            {store ? (
              <>
                <p className="font-display text-ui text-ink-dim italic">Correction to the entry for</p>
                <p className="mt-1 font-display text-heading font-bold text-ink">{store.name}</p>
                <p className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-ui">
                  <span className="font-mono text-meta text-ink-quiet">{store.slug}</span>
                  <Link href={`/stores/${encodeURIComponent(store.slug)}`} className={linkClass}>
                    View the entry
                  </Link>
                </p>
              </>
            ) : (
              <p className="font-display text-prose text-ink-dim italic">A correction, or a store the atlas is missing</p>
            )}
          </div>

          {/* The honest stub state, before anyone types */}
          {/* bg, not bg-step: moss link text on light bg-step is 4.33:1, under AA. */}
          <p id="slip-status" className="flex gap-2.5 border-b border-line bg-bg px-5 py-3 text-ui text-ink-dim sm:px-6">
            <InfoMark className="mt-0.5 size-4 text-ink-quiet" />
            <span>
              <span className="font-medium text-ink">This form doesn&apos;t send yet.</span> Sending is planned: it
              waits on the review queue being set up. Until then, nothing typed here is saved or sent. For a
              location fix,{" "}
              <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                editing OpenStreetMap ↗
              </a>{" "}
              works today.
            </span>
          </p>

          <div className="px-5 py-6 sm:px-6">
            <FieldGroup>
              {/* Same label column as the fields below, so every left edge aligns */}
              <div
                role="radiogroup"
                aria-labelledby="submission-type-label"
                className="flex flex-col gap-1.5 @md/field-group:grid @md/field-group:grid-cols-[8.25rem_minmax(0,1fr)] @md/field-group:gap-x-4"
              >
                <span id="submission-type-label" className="text-ui leading-snug text-ink-dim @md/field-group:pt-2">
                  What kind of change?
                </span>
                <div className="flex flex-col @max-md/field-group:-ml-2.5">
                  {SUBMISSION_TYPES.map((t) => (
                    <TypeOption
                      key={t.value}
                      value={t.value}
                      label={t.label}
                      defaultChecked={t.value === (store ? "correction" : "new_store")}
                    />
                  ))}
                </div>
              </div>

              <Field orientation="responsive">
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

              <Field orientation="responsive">
                <FieldLabel htmlFor="email">
                  Your email <span className="font-display text-ink-quiet italic">optional</span>
                </FieldLabel>
                <FieldContent>
                  <Input id="email" name="email" type="email" autoComplete="email" />
                  <FieldDescription>Only used if we need to follow up.</FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </div>

          {/* Plate rule above the send bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t-2 border-ink px-5 py-4 sm:px-6">
            <Button type="submit" disabled>
              Send suggestion
            </Button>
            <span className="font-display text-ui text-ink-quiet italic">Sending is planned, not yet switched on.</span>
          </div>
        </form>
      </main>
    </PageShell>
  );
}
