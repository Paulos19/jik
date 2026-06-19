import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import HubClient from "@/components/hub-client";

export default async function HubPage() {
  const session = await auth();

  // Fetch News Cards
  const newsCards = await prisma.newsCard.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  // Fetch Hub Updates
  const hubUpdates = await prisma.hubUpdate.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  // Serialize dates for client components compatibility
  const serializedNews = newsCards.map((n) => ({
    id: n.id,
    title: n.title,
    summary: n.summary,
    content: n.content,
    imageUrl: n.imageUrl,
    createdAt: n.createdAt.toISOString(),
    author: {
      name: n.author.name,
    },
  }));

  const serializedUpdates = hubUpdates.map((u) => ({
    id: u.id,
    appName: u.appName,
    version: u.version,
    title: u.title,
    description: u.description,
    type: u.type,
    createdAt: u.createdAt.toISOString(),
    author: {
      name: u.author.name,
    },
  }));

  return (
    <HubClient
      user={session?.user}
      news={serializedNews}
      updates={serializedUpdates}
    />
  );
}
