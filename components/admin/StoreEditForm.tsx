"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { storeEditSchema, type StoreEditInput } from "@/lib/admin/schemas";
import { SPECIALTY_TAGS } from "@/lib/admin/types";
import type { AdminStoreRow } from "@/lib/admin/types";
import { updateStoreAction } from "@/app/admin/(dashboard)/stores/actions";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function StoreEditForm({ store }: { store: AdminStoreRow }) {
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
        toast.success("Store updated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <FieldContent>
            <Input id="name" {...register("name")} />
            <FieldError errors={[errors.name]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="city">City</FieldLabel>
          <FieldContent>
            <Input id="city" {...register("city")} />
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="province">Province</FieldLabel>
          <FieldContent>
            <Input id="province" {...register("province")} />
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="postal_code">Postal code</FieldLabel>
          <FieldContent>
            <Input id="postal_code" {...register("postal_code")} />
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <FieldContent>
            <Input id="phone" {...register("phone")} />
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="website">Website</FieldLabel>
          <FieldContent>
            <Input id="website" {...register("website")} />
            <FieldError errors={[errors.website]} />
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
          <FieldContent>
            <Input id="instagram" {...register("instagram")} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="short_description">Description</FieldLabel>
          <FieldContent>
            <Textarea id="short_description" rows={3} {...register("short_description")} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="hours_raw">
            Hours (raw OSM opening_hours string)
          </FieldLabel>
          <FieldContent>
            <Textarea id="hours_raw" rows={2} {...register("hours_raw")} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Specialties</FieldLabel>
          <FieldContent>
            <Controller
              name="specialties"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SPECIALTY_TAGS.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 font-mono text-xs text-ink-dim"
                    >
                      <Checkbox
                        checked={field.value?.includes(tag)}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...(field.value ?? []), tag]
                            : (field.value ?? []).filter((t) => t !== tag);
                          field.onChange(next);
                        }}
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              )}
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isPending || !isDirty} className="mt-6">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
