"use client";

import Link from "next/link";
import type { StoreFeatureProperties } from "@/lib/types";
import { specialtyLabel } from "@/lib/specialties";

interface StoreSidebarProps {
  store: StoreFeatureProperties | null;
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

export default function StoreSidebar({ store }: StoreSidebarProps) {
  if (!store) return null;
  const specialties = normalizeSpecialties(store.specialties);

  // The panel container, and "Back to the index", belong to MapPanel.
  return (
    <article>
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          {store.name}
        </h2>

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
                {specialtyLabel(tag)}
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
    </article>
  );
}
