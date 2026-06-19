import { requireAdmin } from "@/lib/admin";
import AdminLayoutClient from "@/components/admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  const user = {
    name: session.user?.name || "Administrador",
    email: session.user?.email || "",
    image: session.user?.image || null,
    role: (session.user as any)?.role || "ADMIN",
  };

  return (
    <AdminLayoutClient user={user}>
      {children}
    </AdminLayoutClient>
  );
}
