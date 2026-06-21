import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: "postId é obrigatório" }, { status: 400 });
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
        }
      }
    });

    const formattedComments = comments.map(c => ({
      ...c,
      likesCount: c._count.commentLikes
    }));

    return NextResponse.json({ comments: formattedComments });

  } catch (error: any) {
    console.error("Comments Fetch Error:", error);
    return NextResponse.json({ error: "Erro ao carregar comentários" }, { status: 500 });
  }
}
