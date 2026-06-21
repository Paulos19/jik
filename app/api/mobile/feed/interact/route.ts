import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    const userId = decoded.id;
    const body = await request.json();
    const { action, postId, targetProviderId } = body;

    // Like Action
    if (action === "like" && postId) {
      const existingLike = await prisma.nunuLike.findUnique({
        where: { postId_userId: { postId, userId } }
      });

      if (existingLike) {
        await prisma.nunuLike.delete({ where: { id: existingLike.id } });
        return NextResponse.json({ message: "Unliked", liked: false });
      } else {
        await prisma.nunuLike.create({ data: { postId, userId } });
        return NextResponse.json({ message: "Liked", liked: true });
      }
    }

    // Follow Action
    if (action === "follow" && targetProviderId) {
      const existingFollow = await prisma.nunuFollow.findUnique({
        where: { followerUserId_targetProviderId: { followerUserId: userId, targetProviderId } }
      });

      if (existingFollow) {
        await prisma.nunuFollow.delete({ where: { id: existingFollow.id } });
        return NextResponse.json({ message: "Unfollowed", following: false });
      } else {
        await prisma.nunuFollow.create({ data: { followerUserId: userId, targetProviderId } });
        return NextResponse.json({ message: "Followed", following: true });
      }
    }

    // Repost Action
    if (action === "repost" && postId) {
      const providerProfile = await prisma.nunuProviderProfile.findUnique({
        where: { userId }
      });

      if (!providerProfile) {
        return NextResponse.json({ error: "Apenas prestadores podem repostar no momento." }, { status: 403 });
      }

      // Evitar repost duplicado
      const existingRepost = await prisma.nunuPost.findFirst({
        where: { authorId: providerProfile.id, originalPostId: postId }
      });

      if (existingRepost) {
        return NextResponse.json({ error: "Você já repostou isso." }, { status: 400 });
      }

      // Buscar o post original para clonar mediaUrl e mediaType (para garantir fallback e segurança)
      const original = await prisma.nunuPost.findUnique({ where: { id: postId } });
      if (!original) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

      await prisma.nunuPost.create({
        data: {
          authorId: providerProfile.id,
          originalPostId: postId,
          mediaUrl: original.mediaUrl, // Guardamos a referência mesmo com originalPostId por precaução
          mediaType: original.mediaType,
        }
      });
      return NextResponse.json({ message: "Repostado com sucesso." });
    }

    // Comment Action
    if (action === "comment" && postId && body.content) {
      const comment = await prisma.nunuComment.create({
        data: {
          postId,
          userId,
          content: body.content
        },
        include: { user: { select: { name: true, image: true } } }
      });

      // Detectar menções (ex: @alezudoo)
      const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
      const mentions = body.content.match(mentionRegex);
      
      if (mentions) {
        // Obter os usernames limpos
        const usernames = mentions.map((m: string) => m.substring(1));
        
        // Buscar usuários reais que batem com esses nomes
        const mentionedUsers = await prisma.user.findMany({
          where: { name: { in: usernames } },
          select: { id: true, name: true }
        });

        // Criar notificações para todos os usuários mencionados que não sejam o próprio autor
        const notifications = mentionedUsers
          .filter(u => u.id !== userId)
          .map(u => ({
            type: "MENTION",
            message: `mencionou você em um comentário: "${body.content.substring(0, 30)}..."`,
            recipientUserId: u.id,
            actorUserId: userId
          }));
          
        if (notifications.length > 0) {
          await prisma.nunuNotification.createMany({
            data: notifications
          });
        }
      }

      return NextResponse.json({ message: "Comentário adicionado.", comment });
    }

    // Report Action
    if (action === "report" && postId) {
      await prisma.nunuReport.create({
        data: {
          postId,
          userId,
          reason: body.reason || "Conteúdo impróprio"
        }
      });
      return NextResponse.json({ message: "Denúncia registrada." });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });

  } catch (error: any) {
    console.error("Interact Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
