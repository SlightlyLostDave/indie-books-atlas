"use client";

import { useTransition, type ReactNode } from "react";
import { useForm, useWatch, Controller, type Control, type FieldError as RHFFieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { storeEditSchema, type StoreEditInput } from "@/lib/admin/schemas";
import { SPECIALTY_TAGS } from "@/lib/admin/types";
import type { AdminStoreRow } from "@/lib/admin/types";
import { computeDataQualityScore } from "@/lib/admin/dataQuality";
import { updateStoreAction } from "@/app/admin/(dashboard)/stores/actions";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { Completeness, Unknown } from "@/components/store/EntryParts";
import { specialtyLabel } from "@/lib/specialties";
import { cn } from "@/lib/utils";

/*
 * Friendlier wording for schema errors whose default zod message is
 * technical. Name and website keep the schema's own messages.
 */
const BLANK_ONCE_SET = "Can't be left blank: this form can't remove it once it's set.";

function errorText(field: keyof StoreEditInput, error: RHFFieldError | undefined): string | undefined {
  if (!error) return undefined;
  if ((field === "city" || field === "province") && error.type === "too_small") return BLANK_ONCE_SET;
  return error.message ?? "Check this field.";
}

/** A field label with its required/optional mark set under it in the marginal voice. */
function Label({ htmlFor, children, required = false }: { htmlFor?: string; children: ReactNode; required?: boolean }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="flex-col items-start gap-0 text-ui text-ink">
      <span>{children}</span>
      <span className={cn("font-display text-meta italic", required ? "text-ink-dim" : "text-ink-faint")}>
        {required ? "required" : "optional"}
      </span>
    </FieldLabel>
  );
}

function Invalid({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <FieldError>
      <span aria-hidden="true">× </span>
      {message}
    </FieldError>
  );
}

interface TextFieldProps {
  id: keyof StoreEditInput;
  label: string;
  required?: boolean;
  description?: ReactNode;
  error?: string;
  children: ReactNode;
}

function TextField({ id, label, required, description, error, children }: TextFieldProps) {
  return (
    <Field orientation="responsive" data-invalid={error ? true : undefined}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <FieldContent>
        {children}
        <Invalid message={error} />
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}

function Legend({ children }: { children: ReactNode }) {
  return <FieldLegend className="mb-0">{children}</FieldLegend>;
}

const filled = (v: string | null | undefined) => Boolean(v && v.trim());

/**
 * What the record is missing, using the fields computeDataQualityScore
 * reads, live from the form. Gaps come first with what each would add;
 * recorded fields fold into one line. Verification isn't a form field,
 * so it reads from the saved record.
 */
function RecordGaps({ control, store }: { control: Control<StoreEditInput>; store: AdminStoreRow }) {
  const values = useWatch({ control });

  const rows = [
    { key: "phone", label: "Telephone", points: 20, now: filled(values.phone), was: filled(store.phone) },
    { key: "website", label: "Website", points: 20, now: filled(values.website), was: filled(store.website) },
    { key: "hours_raw", label: "Hours", points: 20, now: filled(values.hours_raw), was: filled(store.hours_raw) },
    { key: "is_verified", label: "Verification", points: 20, now: store.is_verified, was: store.is_verified },
    {
      key: "short_description",
      label: "Description",
      points: 10,
      now: filled(values.short_description),
      was: filled(store.short_description),
    },
    { key: "instagram", label: "Instagram", points: 10, now: filled(values.instagram), was: filled(store.instagram) },
  ];

  const scoreOf = (present: (k: string) => boolean) =>
    computeDataQualityScore({
      phone: present("phone") ? "x" : null,
      website: present("website") ? "x" : null,
      hours_raw: present("hours_raw") ? "x" : null,
      is_verified: store.is_verified,
      short_description: present("short_description") ? "x" : null,
      instagram: present("instagram") ? "x" : null,
    });
  const savedScore = scoreOf((k) => rows.find((r) => r.key === k)!.was);
  const liveScore = scoreOf((k) => rows.find((r) => r.key === k)!.now);

  const missing = rows.filter((r) => !r.now);
  const recorded = rows.filter((r) => r.now);

  return (
    <section aria-labelledby="gaps-heading" className="border-t-2 border-ink pt-3">
      <h2 id="gaps-heading" className="font-display text-heading font-semibold text-ink">
        What&apos;s missing
      </h2>
      <Completeness score={liveScore} className="mt-2" />
      <div aria-live="polite" className="font-display text-ui text-ink-dim italic">
        {liveScore !== savedScore ? (
          <p className="mt-1">
            <span className="font-mono not-italic tabular-nums">{savedScore}</span> now. Saving makes it{" "}
            <span className="font-mono not-italic tabular-nums">{liveScore}</span>.
          </p>
        ) : store.data_quality_score !== savedScore ? (
          <p className="mt-1">
            The stored score is <span className="font-mono not-italic tabular-nums">{store.data_quality_score}</span>.
            The next save corrects it.
          </p>
        ) : null}
      </div>

      {missing.length > 0 ? (
        <ul className="mt-3 border-t border-ink-faint">
          {missing.map((row) => (
            <li key={row.key} className="flex items-baseline justify-between gap-3 border-b border-line py-(--row-y) text-ui">
              <span className="text-ink">{row.label}</span>
              <span className="flex items-baseline gap-3">
                <Unknown>
                  {row.key === "is_verified" ? "Not verified" : row.was ? "Removed, not saved" : "Not recorded"}
                </Unknown>
                <span className="w-7 text-right font-mono text-meta text-ink-faint tabular-nums">+{row.points}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 border-t border-ink-faint pt-3 text-ui text-ink-dim">
          Nothing missing. Every field the score counts is recorded.
        </p>
      )}

      {[
        { rows: recorded.filter((r) => r.was), lead: "Recorded" },
        { rows: recorded.filter((r) => !r.was), lead: "Added, not saved yet" },
      ].map(
        ({ rows: group, lead }) =>
          group.length > 0 && (
            <p key={lead} className="mt-3 flex items-baseline gap-1.5 text-ui text-ink-dim">
              <CheckIcon
                className={cn("size-3.5 translate-y-0.5", lead === "Recorded" ? "text-moss" : "text-ink-faint")}
                strokeWidth={2}
              />
              <span>
                {lead}: {group.map((r) => (r.key === "is_verified" ? "verified" : r.label.toLowerCase())).join(", ")}.
              </span>
            </p>
          ),
      )}

      {(store.lat == null || store.lng == null) && (
        <p className="mt-3 text-ui text-ink-dim">
          <Unknown>Not on the map:</Unknown> no coordinates. Location comes from the pipeline and can&apos;t be set
          here.
        </p>
      )}

      {missing.some((r) => r.key === "is_verified") && (
        <p className="mt-3 text-meta text-ink-faint">Verification is set under Status, not in the form.</p>
      )}
    </section>
  );
}

export function StoreEditForm({ store, aside }: { store: AdminStoreRow; aside?: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<StoreEditInput>({
    resolver: zodResolver(storeEditSchema),
    defaultValues: {
      name: store.name,
      city: store.city,
      province: store.province,
      postal_code: store.postal_code,
      phone: store.phone,
      website: store.website ?? "",
      instagram: store.instagram,
      short_description: store.short_description,
      hours_raw: store.hours_raw,
      specialties: (store.specialties ?? []) as StoreEditInput["specialties"],
    },
  });

  function onSubmit(values: StoreEditInput) {
    startTransition(async () => {
      const result = await updateStoreAction(store.slug, values);
      if (result.success) {
        toast.success("Changes saved");
        router.refresh();
      } else {
        toast.error("Couldn't save the changes", { description: result.error, duration: 10000 });
      }
    });
  }

  const messages = {
    name: errorText("name", errors.name),
    city: errorText("city", errors.city),
    province: errorText("province", errors.province),
    postal_code: errorText("postal_code", errors.postal_code),
    phone: errorText("phone", errors.phone),
    website: errorText("website", errors.website),
    instagram: errorText("instagram", errors.instagram),
    short_description: errorText("short_description", errors.short_description),
    hours_raw: errorText("hours_raw", errors.hours_raw),
    specialties: errors.specialties ? (errors.specialties.message ?? "Choose from the listed specialties.") : undefined,
  };
  const errorCount = Object.values(messages).filter(Boolean).length;

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-(--gap-section) lg:grid-cols-[minmax(0,1fr)_19rem]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="min-w-0 max-w-[44rem]">
        <div className="flex flex-col gap-(--gap-section)">
          <FieldSet>
            <Legend>Identity</Legend>
            <FieldGroup>
              <TextField id="name" label="Name" required error={messages.name}>
                <Input id="name" aria-invalid={messages.name ? true : undefined} {...register("name")} />
              </TextField>
              <TextField
                id="short_description"
                label="Description"
                error={messages.short_description}
                description="One or two sentences, shown under the name on the store's public page."
              >
                <Textarea
                  id="short_description"
                  rows={3}
                  aria-invalid={messages.short_description ? true : undefined}
                  {...register("short_description")}
                />
              </TextField>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <Legend>Location</Legend>
            <FieldGroup>
              <TextField id="city" label="City" error={messages.city}>
                <Input id="city" aria-invalid={messages.city ? true : undefined} {...register("city")} />
              </TextField>
              <TextField
                id="province"
                label="Province"
                error={messages.province}
                description="The two-letter code, as stored: ON, QC, BC."
              >
                <Input
                  id="province"
                  className="max-w-24"
                  aria-invalid={messages.province ? true : undefined}
                  {...register("province")}
                />
              </TextField>
              <TextField id="postal_code" label="Postal code" error={messages.postal_code}>
                <Input
                  id="postal_code"
                  className="max-w-32"
                  aria-invalid={messages.postal_code ? true : undefined}
                  {...register("postal_code")}
                />
              </TextField>
            </FieldGroup>
            <FieldDescription>
              The street address and the map point come from the pipeline and can&apos;t be edited here.
            </FieldDescription>
          </FieldSet>

          <FieldSet>
            <Legend>Contact</Legend>
            <FieldGroup>
              <TextField id="phone" label="Telephone" error={messages.phone}>
                <Input id="phone" type="tel" className="max-w-56" aria-invalid={messages.phone ? true : undefined} {...register("phone")} />
              </TextField>
              <TextField
                id="website"
                label="Website"
                error={messages.website}
                description="The full address, starting https://"
              >
                <Input id="website" type="url" aria-invalid={messages.website ? true : undefined} {...register("website")} />
              </TextField>
              <TextField id="instagram" label="Instagram" error={messages.instagram} description="A handle or a profile link.">
                <Input id="instagram" aria-invalid={messages.instagram ? true : undefined} {...register("instagram")} />
              </TextField>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <Legend>Hours</Legend>
            <FieldGroup>
              <TextField
                id="hours_raw"
                label="Opening hours"
                error={messages.hours_raw}
                description={
                  <>
                    The OpenStreetMap <code className="bg-bg-step px-1 font-mono">opening_hours</code> string, saved as
                    written, for example <span className="font-mono">Mo-Sa 10:00-18:00</span>. The public page shows
                    the parsed week, which this form doesn&apos;t update. It changes when the hours are next parsed.
                  </>
                }
              >
                <Textarea
                  id="hours_raw"
                  rows={2}
                  className="min-h-14 font-mono text-ui"
                  aria-invalid={messages.hours_raw ? true : undefined}
                  {...register("hours_raw")}
                />
              </TextField>
            </FieldGroup>
          </FieldSet>

          <FieldSet data-invalid={messages.specialties ? true : undefined}>
            <Legend>Specialties</Legend>
            <FieldDescription>Optional. Most stores have none; tick only what the store is known for.</FieldDescription>
            <Controller
              name="specialties"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
                  {SPECIALTY_TAGS.map((tag) => (
                    <label key={tag} className="flex items-center gap-2 text-ui text-ink">
                      <Checkbox
                        checked={field.value?.includes(tag)}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...(field.value ?? []), tag]
                            : (field.value ?? []).filter((t) => t !== tag);
                          field.onChange(next);
                        }}
                      />
                      {specialtyLabel(tag)}
                    </label>
                  ))}
                </div>
              )}
            />
            <Invalid message={messages.specialties} />
          </FieldSet>
        </div>

        {/* The save bar: the plate rule above it, pinned to the foot while the form scrolls. */}
        <div className="sticky bottom-0 z-10 mt-(--gap-section) flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink bg-bg py-3">
          <p aria-live="polite" className="text-ui">
            {errorCount > 0 ? (
              <span className="text-danger">
                <span aria-hidden="true">× </span>
                {errorCount === 1 ? "One field needs attention." : `${errorCount} fields need attention.`}
              </span>
            ) : isDirty ? (
              <span className="text-ink">Unsaved changes.</span>
            ) : (
              <span className="font-display text-ink-faint italic">No unsaved changes.</span>
            )}
          </p>
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <aside aria-label="The record" className="flex min-w-0 flex-col gap-(--gap-section) lg:sticky lg:top-6 lg:self-start">
        <RecordGaps control={control} store={store} />
        {aside}
      </aside>
    </div>
  );
}
