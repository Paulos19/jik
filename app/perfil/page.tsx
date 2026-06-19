import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./profile-client";

export default async function PerfilPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      forumPosts: {
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
        },
      },
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  // Map Date objects to string for client component compatibility
  const serializedUser = {
    ...dbUser,
    createdAt: dbUser.createdAt.toISOString(),
    updatedAt: dbUser.updatedAt.toISOString(),
    forumPosts: dbUser.forumPosts.map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    })),
  };

  return <ProfileClient user={serializedUser} />;
}
