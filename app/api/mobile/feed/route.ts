import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = 10;

    let userId: string | null = null;
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {}
    }

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
        },
        likes: userId ? {
          where: { userId }
        } : false,
        originalPost: {
          include: {
            author: {
              include: { user: { select: { name: true, image: true, id: true } } }
            },
            service: true
          }
        }
      }
    });

    let nextCursor = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    // Format for mobile
    const formattedPosts = posts.map(post => {
      // Se for repost, os dados de mídia vêm do originalPost
      const targetPost = post.originalPostId && post.originalPost ? post.originalPost : post;
      
      return {
        id: post.id,
        isRepost: !!post.originalPostId,
        repostedBy: post.originalPostId ? post.author.user.name : null,
        mediaUrl: targetPost.mediaUrl,
        mediaType: targetPost.mediaType,
        caption: targetPost.caption,
        viewCount: targetPost.viewCount,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        isLiked: (post as any).likes && (post as any).likes.length > 0,
        createdAt: post.createdAt,
        author: {
          profileId: targetPost.author.id,
          userId: targetPost.author.user.id,
          name: targetPost.author.user.name,
          avatar: targetPost.author.user.image,
        },
        service: targetPost.service ? {
          id: targetPost.service.id,
          title: targetPost.service.title,
          price: targetPost.service.price
        } : null
      };
    });

    return NextResponse.json({
      posts: formattedPosts,
      nextCursor
    });

  } catch (error: any) {
    console.error("Feed API Error:", error);
    return NextResponse.json({ error: "Erro ao carregar o feed" }, { status: 500 });
  }
}
