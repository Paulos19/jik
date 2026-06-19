import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ForumClient from "@/components/forum-client";

export default async function ForumPage() {
  const session = await auth();

  // Fetch Categories
  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: "asc" },
  });

  // Fetch Posts
  const posts = await prisma.forumPost.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
    orderBy: [
      { pinned: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Fetch Latest Published News Card for the Admin Banner
  const latestNews = await prisma.newsCard.findFirst({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for client components compatibility
  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    color: c.color,
    order: c.order,
  }));

  const serializedPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    imageUrl: p.imageUrl,
    published: p.published,
    pinned: p.pinned,
    locked: p.locked,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    author: {
      id: p.author.id,
      name: p.author.name,
      image: p.author.image,
    },
    category: {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
      color: p.category.color,
    },
  }));

  const serializedNews = latestNews
    ? {
        id: latestNews.id,
        title: latestNews.title,
        summary: latestNews.summary,
        content: latestNews.content,
        imageUrl: latestNews.imageUrl,
        createdAt: latestNews.createdAt.toISOString(),
      }
    : null;

  return (
    <ForumClient
      user={session?.user}
      initialPosts={serializedPosts}
      initialCategories={serializedCategories}
      latestNews={serializedNews}
    />
  );
}
