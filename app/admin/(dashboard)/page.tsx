import Link from "next/link";
import { getDashboardMetrics } from "@/lib/admin/dashboard";
import { Badge } from "@/components/ui/badge";

function MetricTile({
  label,
  value,
  href,
  approximate,
}: {
  label: string;
  value: string | number;
  href?: string;
  approximate?: boolean;
}) {
  const content = (
    <div className="rounded-lg border border-line bg-bg-raised p-5 transition-colors hover:border-line-strong">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-dim">
          {label}
        </span>
        {approximate && (
          <Badge variant="secondary" className="text-[10px]">
            approximate
          </Badge>
        )}
      </div>
      <div className="mt-2 font-display text-3xl font-bold text-ink">
        {value}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">Dashboard</h1>
      <p className="mt-2 text-ink-dim">
        Store verification and data-quality triage overview.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricTile label="Total stores" value={metrics.totalStores} href="/admin/stores" />
        <MetricTile
          label="Needs review"
          value={metrics.needsReviewCount}
          href="/admin/stores?needsReview=true"
        />
        <MetricTile
          label="Pending submissions"
          value={metrics.pendingSubmissionsCount}
          href="/admin/submissions"
        />
        <MetricTile
          label="Unverified 90+ days"
          value={metrics.unverified90DaysCount}
          href="/admin/stores?verified=unverified"
          approximate
        />
        <MetricTile
          label="Quality score < 40"
          value={metrics.lowQualityCount}
          href="/admin/stores?maxQualityScore=39"
        />
        <MetricTile
          label="Last pipeline sync"
          value={
            metrics.lastSyncDate
              ? new Date(metrics.lastSyncDate).toLocaleDateString()
              : "—"
          }
          approximate
        />
      </div>
    </div>
  );
}
