import type { ReactNode } from "react";
import Link from "next/link";
import { quietLinkClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

/**
 * The title block of an admin page: an optional way back, the title in
 * Playfair, a line in the marginal voice, and anything else (status, meta)
 * above the 2px plate rule that closes the block (DESIGN.md, Shape).
 */
export function AdminPageHeader({
  title,
  lede,
  back,
  marker,
  children,
  className,
}: {
  title: ReactNode;
  /** One line in Playfair italic under the title. */
  lede?: ReactNode;
  /** A way back up, e.g. { href: "/admin/stores", label: "Stores" }. */
  back?: { href: string; label: string };
  /** A marginal word after the title, such as "planned". */
  marker?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-b-2 border-ink pb-3", className)}>
      {back && (
        <p className="mb-2 text-ui">
          <Link href={back.href} className={quietLinkClass}>
            ← {back.label}
          </Link>
        </p>
      )}
      <h1 className="flex flex-wrap items-baseline gap-x-3 font-display text-title font-bold text-balance text-ink">
        {title}
        {marker && <span className="font-display text-prose font-normal text-ink-faint italic">{marker}</span>}
      </h1>
      {lede && <p className="mt-1.5 font-display text-prose text-ink-dim italic">{lede}</p>}
      {children}
    </header>
  );
}
