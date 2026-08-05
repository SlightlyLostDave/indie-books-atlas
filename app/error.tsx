"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="font-display text-xl text-ink">The atlas couldn&apos;t load</p>
      <p className="max-w-md font-mono text-xs text-ink-dim">{error.message}</p>
      <button
        onClick={reset}
        className="rounded border border-line-strong px-4 py-2 font-mono text-xs uppercase tracking-widest text-moss hover:border-moss"
      >
        Try again
      </button>
    </div>
  );
}
