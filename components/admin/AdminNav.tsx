"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", planned: false },
  { label: "Stores", href: "/admin/stores", planned: false },
  { label: "Submissions", href: "/admin/submissions", planned: true },
  { label: "Events", href: "/admin/events", planned: true },
  { label: "Users", href: "/admin/users", planned: true },
] as const;

/**
 * The compilation office's rail (docs/design/DESIGN.md, Layout frames).
 * Same palette and families as the public atlas, set as a back-office
 * register: wordmark and "Compilation office", sections with a moss rule on
 * the current one, then the theme, a way out to the public atlas and the
 * Clerk UserButton at the foot. Under 768px it becomes a top strip with
 * scrolling tabs.
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 flex flex-col border-b border-ink-faint bg-bg-raised md:h-dvh md:border-r md:border-b-0">
      <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2 md:block md:border-b md:border-ink-faint md:px-[1.125rem] md:pt-[1.125rem] md:pb-3.5">
        <Link href="/admin" className="block no-underline">
          <span className="block font-display text-[1.0625rem] leading-tight font-bold text-ink">
            Indie Books Atlas
          </span>
          <span className="block font-display text-[0.84375rem] text-ink-dim italic">
            Compilation office
          </span>
        </Link>
        <div className="flex items-center md:hidden">
          <UserButton />
        </div>
      </div>

      <nav aria-label="Admin sections" className="max-md:overflow-x-auto md:flex-1 md:py-2.5">
        <ul className="flex md:flex-col">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);

            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-baseline justify-between gap-3 text-ui whitespace-nowrap no-underline transition-colors duration-(--dur-quick)",
                    "border-b-2 px-3 pt-2 pb-2 md:border-b-0 md:border-l-2 md:py-[0.4375rem] md:pr-[1.125rem] md:pl-4",
                    isActive
                      ? "border-moss bg-bg-step font-medium text-ink"
                      : "border-transparent text-ink-dim hover:bg-bg-step hover:text-ink",
                  )}
                >
                  <span>{item.label}</span>
                  {item.planned && (
                    <span className="hidden font-display text-meta font-normal text-ink-faint italic md:inline">
                      planned
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden flex-col items-start gap-3 border-t border-line px-[1.125rem] py-3.5 md:flex">
        <ThemeToggle />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ui text-ink-dim no-underline transition-colors duration-(--dur-quick) hover:text-moss"
        >
          View the public atlas ↗
        </a>
        <UserButton showName />
      </div>
    </aside>
  );
}
