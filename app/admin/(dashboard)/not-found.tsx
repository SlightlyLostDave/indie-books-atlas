import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { linkClass } from "@/lib/styles";

/**
 * An admin address with nothing behind it, inside the office shell instead
 * of Next's stock 404 (AUDIT F-ADMIN-11).
 */
export default function AdminNotFound() {
  return (
    <article className="grid max-w-4xl gap-x-10 gap-y-2 lg:grid-cols-[8rem_minmax(0,1fr)]">
      <p className="font-display text-ui text-ink-quiet italic lg:pt-2">
        No entry <span className="font-mono not-italic">404</span>
      </p>
      <div className="min-w-0 max-w-[38rem]">
        <h1 className="font-display text-title font-bold text-ink">Nothing at this address</h1>
        <p className="mt-3 border-t-2 border-ink pt-3 text-body text-ink-dim">
          No store has this slug. It may have been mistyped, or the store&apos;s slug may differ from its name.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/admin/stores" className={buttonVariants({ variant: "default" })}>
            Search the stores
          </Link>
          <Link href="/admin" className={`${linkClass} text-ui`}>
            ← Back to the dashboard
          </Link>
        </div>
      </div>
    </article>
  );
}
