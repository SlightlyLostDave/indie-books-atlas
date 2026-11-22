import { requireAdminPage } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  // Compact density: the same design system, tuned for scan speed
  // (docs/design/DESIGN.md, Density). --admin-sticky-top is where sticky
  // content (the stores table header) pins: under the rail's top strip on
  // small screens, at the top of the page beside the rail from 768px.
  return (
    <div
      data-density="compact"
      className="min-h-dvh bg-bg text-ui [--admin-sticky-top:6rem] md:grid md:grid-cols-[13.5rem_minmax(0,1fr)] md:[--admin-sticky-top:0px]"
    >
      <AdminNav />
      <main className="min-w-0 px-(--gutter) pt-6 pb-12">{children}</main>
      <Toaster />
    </div>
  );
}
