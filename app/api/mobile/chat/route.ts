import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar chats onde o usuário é participante
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // apenas a última mensagem
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Formatar para mobile
    const formattedChats = chats.map((chat) => {
      // Identificar o outro participante (para chats 1-1)
      const otherParticipant = chat.participants.find((p) => p.userId !== userId);
      const myParticipant = chat.participants.find((p) => p.userId === userId);

      return {
        id: chat.id,
        isGroup: chat.isGroup,
        name: chat.isGroup ? chat.name : otherParticipant?.user.name,
        photoUrl: chat.isGroup ? chat.photoUrl : otherParticipant?.user.image,
        unreadCount: myParticipant?.unreadCount || 0,
        lastMessage: chat.messages[0] || null,
        updatedAt: chat.updatedAt,
        otherUserId: otherParticipant?.userId,
      };
    });

    return NextResponse.json(formattedChats);
  } catch (error) {
    console.error("GET CHATS ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const myUserId = session.user.id;
    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: "Target User ID is required" }, { status: 400 });
    }

    if (myUserId === targetUserId) {
      return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
    }

    // TODO: Validar se são seguidores mútuos ou se há contrato de serviço
    // Por enquanto, permitimos a criação.
    
    // Verificar se já existe um chat 1-1 entre eles
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: myUserId } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
    });

    if (existingChat) {
      return NextResponse.json({ chat: existingChat });
    }

    // Criar novo chat
    const newChat = await prisma.chat.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: myUserId },
            { userId: targetUserId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json({ chat: newChat });
  } catch (error) {
    console.error("POST CHAT ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
