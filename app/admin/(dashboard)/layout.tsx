import { requireAdminPage } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      <Toaster />
    </div>
  );
}
