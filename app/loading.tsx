export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex w-56 flex-col items-center gap-4">
        <p className="font-eyebrow text-[0.65rem] uppercase tracking-[0.3em] text-amber">
          Indie Books Atlas
        </p>
        <div className="loading-bar-track h-px w-full">
          <div className="loading-bar-fill" />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-dim">
          Loading the atlas…
        </p>
      </div>
    </div>
  );
}
