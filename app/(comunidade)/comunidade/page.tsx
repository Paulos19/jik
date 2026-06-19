import { auth } from "@/auth";
import ComunidadeClient from "@/components/comunidade-client";
import { prisma } from "@/lib/prisma";

// Force compilation reload to update global prisma schema client references
export default async function ComunidadePage() {
  const session = await auth();

  // Fetch some news cards to display as articles/blogs
  const news = await prisma.newsCard.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const serializedNews = news.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    content: item.content,
    imageUrl: item.imageUrl,
    createdAt: item.createdAt.toISOString(),
  }));

  // Fetch communities from database
  const dbCommunities = await prisma.community.findMany({
    include: { creator: true },
    orderBy: { createdAt: "desc" },
  });

  // Serialize communities
  const serializedCommunities = dbCommunities.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    type: item.type as "public" | "restricted",
    creatorId: item.creatorId,
    creatorPlan: item.creatorPlan as any,
    memberCount: item.memberCount,
    tags: item.tags,
    bannerGradient: item.bannerGradient || "from-[#336E72]/40 to-neutral-900",
    creatorName: item.creator.name,
    creatorImage: item.creator.image,
  }));

  let serializedUser = null;
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, image: true }
    });
    if (dbUser) {
      serializedUser = dbUser;
    }
  }

  return (
    <ComunidadeClient
      user={serializedUser}
      initialArticles={serializedNews}
      initialCommunities={serializedCommunities}
    />
  );
}
