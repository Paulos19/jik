import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, communityId, userName, userEmail } = body;

    if (!message) {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 });
    }

    const n8nWebhookUrl = process.env.N8N_CHATBOT_WEBHOOK_URL;

    if (n8nWebhookUrl) {
      // Forward request to n8n chatbot workflow
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            communityId,
            userName: userName || "Membro JiK",
            userEmail: userEmail || "anonimo@jik.com",
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(`n8n webhook returned status ${response.status}`);
        }

        const data = await response.json();
        // Assuming n8n returns an object with a response/reply property
        const reply = data.reply || data.response || data.text || JSON.stringify(data);
        return NextResponse.json({ reply });
      } catch (err: any) {
        console.error("Error communicating with n8n chatbot webhook:", err);
        return NextResponse.json({
          reply: `[Erro de Integração] Desculpe, não consegui me conectar ao serviço principal do chatbot (n8n). Detalhes: ${err.message}. Mas estou aqui para te apoiar!`,
        });
      }
    }

    // Fallback: Smart Mock Chatbot response if webhook not configured yet
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate thinking

    const msgLower = message.toLowerCase();
    let reply = "";

    if (msgLower.includes("oi") || msgLower.includes("olá") || msgLower.includes("ola") || msgLower.includes("bom dia") || msgLower.includes("boa tarde")) {
      reply = `Olá, ${userName || "visitante"}! Eu sou o assistente virtual da comunidade JiK. Como posso ajudar nos seus estudos, debates ou projetos hoje?`;
    } else if (msgLower.includes("plano") || msgLower.includes("assinatura") || msgLower.includes("stripe")) {
      reply = "Os planos JiK (Básico, Pro e Elite) definem os limites de criação de comunidades e convites. A integração com o Stripe facilitará upgrades automáticos. Posso ajudar a estruturar um plano de metas para sua equipe?";
    } else if (msgLower.includes("estudo") || msgLower.includes("debater") || msgLower.includes("aprender")) {
      reply = "Para debates produtivos, recomendo estabelecer tópicos centrais e fazer leituras orientadas. O método de fichamento e discussões socráticas é excelente para reter conhecimento aqui no fórum.";
    } else if (msgLower.includes("n8n") || msgLower.includes("bot") || msgLower.includes("chatbot")) {
      reply = "Olá! Atualmente estou rodando no modo simulado (offline). Assim que você configurar a variável `N8N_CHATBOT_WEBHOOK_URL` no seu arquivo `.env`, eu irei encaminhar todas as nossas mensagens diretamente para o seu fluxo do n8n!";
    } else if (msgLower.includes("ajuda") || msgLower.includes("como funciona")) {
      reply = "Aqui na sala de debates, você pode navegar pelos canais temáticos no painel esquerdo, interagir com outros membros em tempo real, ou conversar comigo neste canal de inteligência artificial.";
    } else {
      reply = `Entendi a sua colocação sobre "${message}". Como um assistente de estudos e cooperação, vejo que esse assunto pode ser aprofundado se criarmos um tópico no fórum ou debatermos nos canais da comunidade! O que você acha?`;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
