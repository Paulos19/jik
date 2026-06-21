import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = 10;

    const posts = await prisma.nunuPost.findMany({
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          include: {
            user: {
              select: { name: true, image: true, id: true }
            }
          }
        },
        service: true,
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    let nextCursor = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    // Format for mobile
    const formattedPosts = posts.map(post => ({
      id: post.id,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      caption: post.caption,
      viewCount: post.viewCount,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      createdAt: post.createdAt,
      author: {
        profileId: post.author.id,
        userId: post.author.user.id,
        name: post.author.user.name,
        avatar: post.author.user.image,
      },
      service: post.service ? {
        id: post.service.id,
        title: post.service.title,
        price: post.service.price
      } : null
    }));

    return NextResponse.json({
      posts: formattedPosts,
      nextCursor
    });

  } catch (error: any) {
    console.error("Feed API Error:", error);
    return NextResponse.json({ error: "Erro ao carregar o feed" }, { status: 500 });
  }
}
