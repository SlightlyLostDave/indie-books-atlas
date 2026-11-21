import { createClient } from "@supabase/supabase-js";

/**
 * Cookieless Supabase client for public, cacheable reads (SSG/ISR pages,
 * `generateStaticParams`, sitemap). Unlike `lib/supabase/server.ts` it never
 * touches `cookies()`, so it doesn't opt a route into dynamic rendering and
 * works at build time. RLS still applies: public read on verified stores only.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable.",
    );
  }

  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
