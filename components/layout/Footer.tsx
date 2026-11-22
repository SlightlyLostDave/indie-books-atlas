import Link from "next/link";
import { cn } from "@/lib/utils";

const YEAR = new Date().getFullYear();

const quietLink = "text-ink-dim no-underline transition-colors duration-(--dur-quick) hover:text-moss";

/**
 * The atlas credits: the same four links wherever they appear. On the home
 * page they run along the plate's foot margin; on content pages they close
 * the page shell's colophon.
 */
export function CreditLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="About this atlas" className={className}>
      <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <li>
          <Link href="/about" className={quietLink}>
            About
          </Link>
        </li>
        <li>
          <Link href="/submit" className={quietLink}>
            Suggest a store
          </Link>
        </li>
        <li>
          <a
            href="https://github.com/SlightlyLostDave/indie-books-atlas-pipeline"
            target="_blank"
            rel="noopener noreferrer"
            className={quietLink}
          >
            GitHub ↗
          </a>
        </li>
        <li>
          <a href="https://davebeach.me" target="_blank" rel="noopener noreferrer" className={quietLink}>
            Built by Dave Beach ↗
          </a>
        </li>
      </ul>
    </nav>
  );
}

export function Imprint({ className }: { className?: string }) {
  return <p className={cn("text-ink-quiet", className)}>© {YEAR} Indie Books Atlas</p>;
}

/** The page shell's colophon, under a neatline. */
export default function Footer() {
  return (
    <footer className="border-t border-ink-faint">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-(--gutter) py-5 text-ui">
        <Imprint />
        <CreditLinks />
      </div>
    </footer>
  );
}
