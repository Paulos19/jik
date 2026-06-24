import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

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

    // Zerar contador de não lidas
    await prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      data: {
        unreadCount: 0,
        lastReadAt: new Date(),
      },
    });

    // Atualizar status das mensagens recebidas para READ
    await prisma.chatMessage.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        status: { in: ["SENT", "DELIVERED"] },
      },
      data: {
        status: "READ",
      },
    });

    // TODO: Disparar evento Pusher para o outro usuário saber que foi lido

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST MARK READ ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
