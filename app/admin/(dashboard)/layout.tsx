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
  // (docs/design/DESIGN.md, Density).
  return (
    <div
      data-density="compact"
      className="min-h-dvh bg-bg text-ui md:grid md:grid-cols-[13.5rem_minmax(0,1fr)]"
    >
      <AdminNav />
      <main className="min-w-0 px-(--gutter) pt-6 pb-12">{children}</main>
      <Toaster />
    </div>
  );
}
