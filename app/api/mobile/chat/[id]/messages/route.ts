import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { pusherServer } from "@/lib/pusher";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = decoded.id;
    const { id: chatId } = await params;
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    // Verificar se usuário é participante
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { chatId },
      take: limit + 1, // +1 para verificar se há próxima página
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" }, // Do mais recente pro mais antigo (para a FlatList invertida)
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    let nextCursor: string | null = null;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id || null;
    }

    return NextResponse.json({
      messages,
      nextCursor,
    });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = decoded.id;
    const { id: chatId } = await params;
    const { content, type = "TEXT", mediaUrl } = await req.json();

    if (!content && !mediaUrl) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // Verificar se usuário é participante
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    // Criar mensagem
    const newMessage = await prisma.chatMessage.create({
      data: {
        chatId,
        senderId: userId,
        content: content || "",
        type,
        mediaUrl,
        status: "SENT",
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Atualizar unreadCount dos outros participantes
    await prisma.chatParticipant.updateMany({
      where: {
        chatId,
        userId: { not: userId },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    // Atualizar updatedAt do Chat para subir na lista
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Disparar evento Pusher
    try {
      await pusherServer.trigger(`chat-${chatId}`, "new-message", newMessage);
      
      // Marcar como entregue se os usuários receberem, mas por enquanto:
      await prisma.chatMessage.update({
        where: { id: newMessage.id },
        data: { status: "DELIVERED" }
      });
    } catch (e) {
      console.log("Pusher trigger failed:", e);
    }

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("POST MESSAGE ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
