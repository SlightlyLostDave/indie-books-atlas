import type { ReactNode } from "react";
import Link from "next/link";
import { getDashboardMetrics } from "@/lib/admin/dashboard";
import DataFreshness from "@/components/layout/DataFreshness";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusMark } from "@/components/admin/StatusMark";
import { figure } from "@/components/admin/labels";
import { linkClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

interface TriageItem {
  key: string;
  count: number;
  title: ReactNode;
  /** What the figure means and what to do about it. */
  note: ReactNode;
  /** A caveat set as a marginal note under the entry. */
  caveat?: ReactNode;
  href: string;
  action: string;
}

/**
 * The dashboard as a triage sheet (DESIGN.md, Do and don't: "work
 * outstanding as large figures, context as a ledger"). The four kinds of
 * work are listed in the order to do them, each with its figure, what it
 * means, and the filtered list that works it. Total stores and the last
 * sync are context, so they sit in a short ledger underneath.
 */
export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();
  const share =
    metrics.totalStores > 0 ? Math.round((metrics.lowQualityCount / metrics.totalStores) * 100) : null;

  const items: TriageItem[] = [
    {
      key: "review",
      count: metrics.needsReviewCount,
      title: <StatusMark status="review" className="gap-1.5 text-ink" />,
      note: "Stores the pipeline has flagged for a person to check, for example when one drops out of OpenStreetMap. Clear each flag from the store's page once it's checked.",
      href: "/admin/stores?needsReview=true",
      action: "Open the review list",
    },
    {
      key: "submissions",
      count: metrics.pendingSubmissionsCount,
      title: "Pending submissions",
      note: "Corrections and missing stores sent from the public form. The form doesn't send yet, so nothing can arrive here.",
      href: "/admin/submissions",
      action: "About the queue",
    },
    {
      key: "low-quality",
      count: metrics.lowQualityCount,
      title: "Completeness below 40",
      note: (
        <>
          {share != null && (
            <>
              <span className="font-mono tabular-nums">{share}%</span> of the catalogue.{" "}
            </>
          )}
          Most of these are a name and a place. A telephone number, website or hours each add 20.
        </>
      ),
      href: "/admin/stores?maxQualityScore=39",
      action: "Open the list",
    },
    {
      key: "unverified",
      count: metrics.unverified90DaysCount,
      title: "Unverified for 90 days or more",
      note: "Stores added more than 90 days ago that nobody has verified.",
      caveat:
        "Approximate. There's no verified-on date yet, so this counts stores never verified since they were added. The list it opens shows every unverified store, whatever its age.",
      href: "/admin/stores?verified=unverified",
      action: "Open the unverified list",
    },
  ];

  return (
    <div className="max-w-5xl">
      <AdminPageHeader title="Dashboard" lede="What needs doing, in the order to do it." />

      <section aria-labelledby="outstanding-heading" className="mt-(--gap-block)">
        <h2 id="outstanding-heading" className="sr-only">
          Work outstanding
        </h2>
        <ol>
          {items.map((item) => {
            const none = item.count === 0;
            return (
              <li
                key={item.key}
                className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-5 gap-y-2 border-b border-line py-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-x-6"
              >
                <p
                  className={cn(
                    "text-right font-mono text-title leading-none tabular-nums lining-nums",
                    none ? "text-ink-faint" : "text-ink",
                  )}
                >
                  {figure(item.count)}
                </p>
                <div className="min-w-0">
                  <h3 className="text-body font-medium text-ink">{item.title}</h3>
                  <p className="mt-1 max-w-[36rem] text-ui text-ink-dim">
                    {none && item.key !== "submissions" ? "Nothing waiting." : item.note}
                  </p>
                  {item.caveat && (
                    <p className="mt-1.5 max-w-[36rem] font-display text-ui text-ink-faint italic">{item.caveat}</p>
                  )}
                </div>
                <p className="col-start-2 text-ui sm:col-start-3 sm:text-right">
                  <Link href={item.href} className={linkClass}>
                    {item.action} →
                  </Link>
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="ledger-heading" className="mt-(--gap-section)">
        <h2 id="ledger-heading" className="font-display text-ui text-ink-dim italic">
          For reference
        </h2>
        <dl className="mt-2 border-t border-ink-faint text-ui">
          <div className="grid grid-cols-1 gap-1 border-b border-line py-(--row-y) sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6">
            <dt className="text-ink-dim">Stores in the catalogue</dt>
            <dd className="text-ink-dim">
              <span className="font-mono text-ink tabular-nums">{figure(metrics.totalStores)}</span>, not counting
              deleted stores.{" "}
              <Link href="/admin/stores" className={linkClass}>
                All stores →
              </Link>
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 border-b border-line py-(--row-y) sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6">
            <dt className="text-ink-dim">Last pipeline sync</dt>
            <dd>
              <DataFreshness syncedAt={metrics.lastSyncDate} />
              {metrics.lastSyncDate && (
                <p className="mt-1 font-display text-ink-faint italic">
                  Approximate. This is the latest pipeline change to any store, which can differ from the sync run
                  the public site reports.
                </p>
              )}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
