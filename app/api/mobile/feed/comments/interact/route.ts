import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;
    const body = await request.json();
    const { action, commentId } = body;

    if (!action || !commentId) {
      return NextResponse.json({ error: "Action and commentId are required" }, { status: 400 });
    }

    if (action === "like") {
      const existingLike = await prisma.nunuCommentLike.findUnique({
        where: { userId_commentId: { userId, commentId } }
      });

      if (existingLike) {
        await prisma.nunuCommentLike.delete({ where: { id: existingLike.id } });
        return NextResponse.json({ message: "Unliked", liked: false });
      } else {
        await prisma.nunuCommentLike.create({ data: { userId, commentId } });
        
        // Se quisermos notificar o autor do comentário:
        const comment = await prisma.nunuComment.findUnique({ where: { id: commentId } });
        if (comment && comment.userId !== userId) {
          await prisma.nunuNotification.create({
            data: {
              type: "LIKE",
              message: "curtiu seu comentário.",
              recipientUserId: comment.userId,
              actorUserId: userId
            }
          });
        }
        
        return NextResponse.json({ message: "Liked", liked: true });
      }
    }

    return NextResponse.json({ error: "Ação não suportada" }, { status: 400 });

  } catch (error: any) {
    console.error("Comment Interact Error:", error);
    return NextResponse.json({ error: "Erro ao interagir com comentário" }, { status: 500 });
  }
}
