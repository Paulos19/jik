import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import UsersClient from "@/components/users-client";

export default async function AdminUsersPage() {
  // Guard page access
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return <UsersClient initialUsers={users} />;
}
