"use server";

import { revalidatePath } from "next/cache";
import * as storesDal from "@/lib/admin/stores";
import { storeEditSchema, setPermanentlyClosedSchema } from "@/lib/admin/schemas";

type ActionResult = { success: true } | { success: false; error: string };

function revalidateStoreSurfaces(slug: string) {
  revalidatePath("/admin/stores");
  revalidatePath(`/admin/stores/${slug}`);
  revalidatePath("/admin");
  // The public home page reads getStoresGeoJSON() directly (not through the
  // cached API route), so a change that affects RLS-gated public visibility
  // (e.g. verification) needs this too.
  revalidatePath("/");
  revalidatePath("/api/stores-geojson");
}

export async function updateStoreAction(
  slug: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = storeEditSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await storesDal.updateStore(slug, parsed.data);
    revalidateStoreSurfaces(slug);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}

export async function toggleVerifiedAction(
  slug: string,
  value: boolean,
): Promise<ActionResult> {
  try {
    await storesDal.setVerified(slug, value);
    revalidateStoreSurfaces(slug);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}

export async function clearNeedsReviewAction(slug: string): Promise<ActionResult> {
  try {
    await storesDal.clearNeedsReview(slug);
    revalidateStoreSurfaces(slug);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}

export async function setPermanentlyClosedAction(
  slug: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = setPermanentlyClosedSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await storesDal.setPermanentlyClosed(slug, parsed.data.value, parsed.data.reason);
    revalidateStoreSurfaces(slug);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}

export async function softDeleteStoreAction(slug: string): Promise<ActionResult> {
  try {
    await storesDal.softDeleteStore(slug);
    revalidateStoreSurfaces(slug);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Delete failed" };
  }
}

export async function restoreStoreAction(slug: string): Promise<ActionResult> {
  try {
    await storesDal.restoreStore(slug);
    revalidateStoreSurfaces(slug);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Restore failed" };
  }
}
