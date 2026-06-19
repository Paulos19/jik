import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { message, communityId, channelId, userName, userEmail } = body;

    if (!message) {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 });
    }

    if (!channelId) {
      return NextResponse.json({ error: "ID do canal é obrigatório" }, { status: 400 });
    }

    // Resolve user from DB if possible
    let dbUser = null;
    const emailToUse = session?.user?.email || userEmail;
    if (emailToUse) {
      dbUser = await prisma.user.findUnique({
        where: { email: emailToUse },
      });
    }

    // 1. Save user message to database
    const userRole = dbUser?.role === "ADMIN" ? "Moderador" : "Membro";
    const userPlan = dbUser ? "Pro" : "Básico";
    const userInitials = userName ? userName.substring(0, 2).toUpperCase() : (dbUser?.name ? dbUser.name.substring(0, 2).toUpperCase() : "ME");

    await prisma.channelMessage.create({
      data: {
        content: message,
        senderId: dbUser?.id || null,
        senderName: userName || dbUser?.name || "Membro",
        senderRole: userRole,
        plan: userPlan,
        avatarUrl: userInitials,
        isAi: false,
        channelId,
      },
    });

    const n8nWebhookUrl = process.env.N8N_CHATBOT_WEBHOOK_URL;
    let reply = "";

    // 2. Resolve Agent Reply (n8n or Mock fallback)
    if (n8nWebhookUrl) {
      try {
        const sessionId = `${channelId}_${dbUser?.id || "anonymous"}`;
        const response = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            chatInput: message,
            communityId,
            channelId,
            sessionId,
            userName: userName || dbUser?.name || "Membro JiK",
            userEmail: emailToUse || "anonimo@jik.com",
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(`n8n webhook returned status ${response.status}`);
        }

        const data = await response.json();
        reply = data.reply || data.response || data.text || JSON.stringify(data);
      } catch (err: any) {
        console.error("Error communicating with n8n chatbot webhook:", err);
        reply = `[Erro de Integração] Desculpe, não consegui me conectar ao serviço do n8n. Detalhes: ${err.message}.`;
      }
    } else {
      // Fallback: Smart Mock Chatbot response
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const msgLower = message.toLowerCase();

      if (msgLower.includes("oi") || msgLower.includes("olá") || msgLower.includes("ola") || msgLower.includes("bom dia") || msgLower.includes("boa tarde")) {
        reply = `Olá, ${userName || dbUser?.name || "visitante"}! Eu sou o assistente virtual da comunidade JiK. Como posso ajudar nos seus estudos, debates ou projetos hoje?`;
      } else if (msgLower.includes("plano") || msgLower.includes("assinatura") || msgLower.includes("stripe")) {
        reply = "Os planos JiK (Básico, Pro e Elite) definem os limites de criação de comunidades e convites. A integração com o Stripe facilitará upgrades automáticos. Posso ajudar a estruturar um plano de metas para sua equipe?";
      } else if (msgLower.includes("estudo") || msgLower.includes("debater") || msgLower.includes("aprender")) {
        reply = "Para debates produtivos, recomendo estabelecer tópicos centrais e fazer leituras orientadas. O método de fichamento e discussões socráticas é excelente para reter conhecimento aqui no fórum.";
      } else if (msgLower.includes("n8n") || msgLower.includes("bot") || msgLower.includes("chatbot")) {
        reply = "Olá! Estou rodando no modo offline. Adicione a variável `N8N_CHATBOT_WEBHOOK_URL` no seu arquivo `.env` para falar com o n8n!";
      } else if (msgLower.includes("ajuda") || msgLower.includes("como funciona")) {
        reply = "Aqui na sala de debates, você pode navegar pelos canais temáticos no painel esquerdo, interagir com outros membros em tempo real, ou conversar comigo neste canal de inteligência artificial.";
      } else {
        reply = `Entendi a sua colocação sobre "${message}". Como um assistente de estudos e cooperação, vejo que esse assunto pode ser aprofundado se criarmos um tópico no fórum ou debatermos nos canais da comunidade! O que você acha?`;
      }
    }

    // 3. Save Bot reply to database
    const savedBotMsg = await prisma.channelMessage.create({
      data: {
        content: reply,
        senderId: null,
        senderName: "JiK Assistente",
        senderRole: "Bot",
        plan: "Staff",
        avatarUrl: "AI",
        isAi: true,
        channelId,
      },
    });

    return NextResponse.json({ reply: savedBotMsg.content });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
