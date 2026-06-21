import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: "postId é obrigatório" }, { status: 400 });
    }

    let userId: string | null = null;
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {}
    }

    const comments = await prisma.nunuComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, image: true, id: true }
        },
        _count: {
          select: { commentLikes: true }
        },
        commentLikes: userId ? {
          where: { userId }
        } : false,
      }
    });

    const formattedComments = comments.map(c => ({
      ...c,
      likesCount: c._count.commentLikes,
      isLiked: (c as any).commentLikes && (c as any).commentLikes.length > 0
    }));

    return NextResponse.json({ comments: formattedComments });

  } catch (error: any) {
    console.error("Comments Fetch Error:", error);
    return NextResponse.json({ error: "Erro ao carregar comentários" }, { status: 500 });
  }
}
