"use client";

import Link from "next/link";
import type { StoreFeatureProperties } from "@/lib/types";

interface StoreSidebarProps {
  store: StoreFeatureProperties | null;
  onClose: () => void;
}

function normalizeSpecialties(specialties: unknown): string[] {
  if (Array.isArray(specialties)) return specialties;
  if (typeof specialties === "string") {
    try {
      const parsed = JSON.parse(specialties);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function StubRow({ label }: { label: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-2 text-sm">
      <span className="font-mono text-xs uppercase tracking-widest text-ink-faint">
        {label}
      </span>
      <span className="italic text-ink-faint">Not yet available</span>
    </div>
  );
}

export default function StoreSidebar({ store, onClose }: StoreSidebarProps) {
  const isOpen = store !== null;
  const specialties = store ? normalizeSpecialties(store.specialties) : [];

  return (
    <aside
      aria-hidden={!isOpen}
      className={`
        fixed inset-x-0 bottom-0 z-20 max-h-[70vh] overflow-y-auto rounded-t-lg border-t border-line bg-bg-raised p-6
        shadow-2xl transition-transform duration-300 ease-out
        ${isOpen ? "translate-y-0" : "translate-y-full"}
        md:static md:inset-auto md:z-auto md:h-full md:w-[380px] md:max-h-none md:flex-shrink-0
        md:rounded-none md:rounded-l-md md:border-l md:border-t-0 md:shadow-none
        ${isOpen ? "md:translate-x-0" : "md:translate-x-full"}
      `}
    >
      {store && (
        <div>
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-ink">
              {store.name}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close store details"
              className="shrink-0 rounded-full border border-line px-2 py-1 font-mono text-xs text-amber transition-colors hover:border-amber-line hover:bg-bg-step"
            >
              ✕
            </button>
          </div>

          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink-dim">
            {[store.city, store.province].filter(Boolean).join(", ") || "Location unknown"}
          </p>

          {specialties.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {specialties.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-moss-deep/40 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-moss"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="mt-4 text-sm leading-relaxed text-ink-dim">
            {store.short_description ?? "No description available yet."}
          </p>

          <div className="mt-6">
            <StubRow label="Address" />
            <StubRow label="Hours" />
            <StubRow label="Phone" />
            <StubRow label="Website" />
          </div>

          <Link
            href={`/stores/${store.slug}`}
            className="mt-6 inline-block font-mono text-xs uppercase tracking-widest text-amber hover:underline"
          >
            View full profile →
          </Link>
        </div>
      )}
    </aside>
  );
}
