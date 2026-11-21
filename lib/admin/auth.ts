import "server-only";
import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Any signed-in Clerk user is a full admin (the Clerk instance is
 * invite-only, no public sign-up). This is the single seam a future
 * role/permission check (e.g. `sessionClaims?.metadata?.role`) slots into
 * without touching every call site.
 */
export const requireAdminSession = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  return { userId };
});

/** For Server Components / pages — redirects to sign-in on failure. */
export async function requireAdminPage() {
  try {
    return await requireAdminSession();
  } catch {
    redirect("/admin/sign-in");
  }
}

/**
 * For Server Actions — throws instead of redirecting. A redirect from
 * inside an action invoked by a mutation (e.g. a stale session expiring
 * between page load and button click) behaves less predictably than
 * throwing and letting the client surface an error/toast.
 */
export async function requireAdminAction() {
  return requireAdminSession();
}
