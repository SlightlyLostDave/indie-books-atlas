"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Stores", href: "/admin/stores" },
  { label: "Submissions", href: "/admin/submissions" },
  { label: "Events", href: "/admin/events" },
  { label: "Users", href: "/admin/users" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/admin"
            className="font-eyebrow text-xs uppercase tracking-widest text-amber"
          >
            Indie Books Atlas · Admin
          </Link>
          <nav className="flex items-center gap-5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-mono text-xs uppercase tracking-widest transition-colors",
                    isActive
                      ? "text-moss"
                      : "text-ink-dim hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <UserButton />
      </div>
    </header>
  );
}
