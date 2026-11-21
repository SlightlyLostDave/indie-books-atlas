import { z } from "zod";
import { SPECIALTY_TAGS } from "@/lib/admin/types";

/**
 * Editable fields on the store edit form. Deliberately excludes: `slug`
 * (immutable), `id`, `data_quality_score` (recomputed server-side, never
 * client-supplied), `is_verified`/`needs_review`/`is_permanently_closed`/
 * `is_deleted` (each has its own dedicated confirm-action, not part of the
 * general edit form), `osm_id`/`google_place_id` (read-only external dedup
 * keys), `created_at`/`updated_at`.
 */
export const storeEditSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  city: z.string().trim().min(1).nullable(),
  province: z.string().trim().min(1).nullable(),
  postal_code: z.string().trim().nullable(),
  phone: z.string().trim().nullable(),
  website: z.string().trim().url("Must be a valid URL").nullable().or(z.literal("")),
  instagram: z.string().trim().nullable(),
  short_description: z.string().trim().nullable(),
  hours_raw: z.string().trim().nullable(),
  specialties: z.array(z.enum(SPECIALTY_TAGS)),
});

export type StoreEditInput = z.infer<typeof storeEditSchema>;

export const setPermanentlyClosedSchema = z.object({
  value: z.boolean(),
  reason: z.string().trim().max(500).optional(),
});

export const rejectSubmissionSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
