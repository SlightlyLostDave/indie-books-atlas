import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Secret-key Supabase client — bypasses RLS. Server-only, admin writes
 * only. Never import this from a "use client" file (the `server-only`
 * import above will fail the build if that happens).
 *
 * Uses a Supabase secret key (`sb_secret_...`), which replaces the legacy
 * JWT `service_role` key and maps to the same `service_role` Postgres role.
 * Supabase also rejects secret keys sent from a browser, as a second line
 * of defence behind `server-only`.
 *
 * Uses `@supabase/supabase-js` directly rather than `@supabase/ssr`'s
 * `createServerClient`: there's no user session/cookies to manage here,
 * just a stateless privileged client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variable.",
    );
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
