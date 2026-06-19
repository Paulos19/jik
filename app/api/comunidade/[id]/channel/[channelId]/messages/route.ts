import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; channelId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { channelId } = await params;

    // Fetch messages from database
    let dbMessages = await prisma.channelMessage.findMany({
      where: { channelId },
      orderBy: { createdAt: "asc" },
    });

    // If no messages exist and it's a default channel, seed them
    if (dbMessages.length === 0) {
      const channel = await prisma.communityChannel.findUnique({
        where: { id: channelId },
      });

      if (channel) {
        let welcomeMsgs: any[] = [];
        if (channel.name === "painel-geral") {
          welcomeMsgs = [
            {
              content: "Sejam muito bem-vindos ao canal geral! Este espaço é para networking e conexões rápidas. Sintam-se à vontade para se apresentar.",
              senderName: "Dr. André Marques",
              senderRole: "Moderador",
              plan: "Elite",
              avatarUrl: "AM",
              createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
            },
            {
              content: "Olá a todos! Feliz em fazer parte. Estou focada em organizar os cronogramas de estudo do próximo mês.",
              senderName: "Sarah Lima",
              senderRole: "Membro",
              plan: "Pro",
              avatarUrl: "SL",
              createdAt: new Date(Date.now() - 3600000), // 1 hour ago
            },
            {
              content: "Excelente iniciativa, Sarah! Se precisar de ajuda para compilar os links de referência, conta comigo.",
              senderName: "Thiago Cardoso",
              senderRole: "Membro",
              plan: "Pro",
              avatarUrl: "TC",
              createdAt: new Date(Date.now() - 1800000), // 30 mins ago
            }
          ];
        } else if (channel.name === "debates-e-estudos") {
          welcomeMsgs = [
            {
              content: "Hoje iniciamos nossa leitura conjunta do ensaio sobre epistemologia moderna. O que vocês acham sobre a divisão empírica do conhecimento?",
              senderName: "Dr. André Marques",
              senderRole: "Moderador",
              plan: "Elite",
              avatarUrl: "AM",
              createdAt: new Date(Date.now() - 86400000), // 1 day ago
            },
            {
              content: "Acredito que ela ajuda a estruturar a pesquisa acadêmica, mas corremos o risco de fragmentar demais o aprendizado integrador.",
              senderName: "Carlos Eduardo",
              senderRole: "Membro",
              plan: "Básico",
              avatarUrl: "CE",
              createdAt: new Date(Date.now() - 72000000), // 20 hours ago
            }
          ];
        } else if (channel.name === "assistente-ia" || channel.isBot) {
          welcomeMsgs = [
            {
              content: "Olá! Sou o Assistente de Debates integrado a esta comunidade. Posso te ajudar a resumir textos, simular questionários ou propor dinâmicas de estudos. O que gostaria de desenvolver hoje?",
              senderName: "JiK Assistente",
              senderRole: "Bot",
              isAi: true,
              avatarUrl: "AI",
            }
          ];
        }

        if (welcomeMsgs.length > 0) {
          await prisma.channelMessage.createMany({
            data: welcomeMsgs.map(m => ({
              ...m,
              channelId,
            }))
          });

          // Fetch again to get updated list with real database records
          dbMessages = await prisma.channelMessage.findMany({
            where: { channelId },
            orderBy: { createdAt: "asc" },
          });
        }
      }
    }

    return NextResponse.json(dbMessages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; channelId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { channelId } = await params;
    const body = await req.json();
    const { content, senderName, senderRole, plan, avatarUrl } = body;

    if (!content) {
      return NextResponse.json({ error: "Conteúdo da mensagem é obrigatório" }, { status: 400 });
    }

    // Find database user
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const newMessage = await prisma.channelMessage.create({
      data: {
        content,
        senderId: dbUser.id,
        senderName: senderName || dbUser.name || "Membro",
        senderRole: senderRole || "Membro",
        plan: plan || "Pro",
        avatarUrl: avatarUrl || (dbUser.name ? dbUser.name.substring(0, 2).toUpperCase() : "ME"),
        isAi: false,
        channelId,
      },
    });

    return NextResponse.json(newMessage);
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
