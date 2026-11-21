"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-danger/40 bg-danger/10 p-6">
      <h2 className="font-display text-xl font-bold text-ink">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-ink-dim">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-md border border-line-strong px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-ink-dim hover:text-ink"
      >
        Try again
      </button>
    </div>
  );
}
