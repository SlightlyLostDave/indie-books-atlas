export default function Footer() {
  return (
    <footer className="border-t border-line px-6 py-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
          © {new Date().getFullYear()} Indie Books Atlas
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a
            href="https://github.com/SlightlyLostDave/indie-books-atlas-pipeline"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-amber hover:underline"
          >
            Github ↗
          </a>
          <a
            href="https://davebeach.me"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-amber hover:underline"
          >
            Built by Dave Beach ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
