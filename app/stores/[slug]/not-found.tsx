import Link from "next/link";
import Footer from "@/components/layout/Footer";

export default function StoreNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">404 · Not in the atlas</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">
          We couldn&apos;t find that bookstore
        </h1>
        <p className="mt-4 leading-relaxed text-ink-dim">
          It may have moved, closed, or not been verified yet. If you know a store that belongs
          here, tell us about it.
        </p>
        <div className="mt-8 flex flex-wrap gap-6">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-amber hover:underline"
          >
            ← Back to the atlas
          </Link>
          <Link
            href="/submit"
            className="font-mono text-xs uppercase tracking-widest text-amber hover:underline"
          >
            Suggest a store →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
