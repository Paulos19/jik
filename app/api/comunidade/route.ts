import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, type, tags } = body;

    if (!name || !description || !type) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    // Find database user
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Create the community
    const newCommunity = await prisma.community.create({
      data: {
        name,
        description,
        type,
        tags: tags || ["Geral"],
        creatorId: dbUser.id,
        creatorPlan: "GRACE", // Default to GRACE (Free) for now
        memberCount: 1,
        bannerGradient: type === "public"
          ? "from-[#336E72]/40 to-neutral-900"
          : "from-indigo-900/30 to-neutral-900",
        channels: {
          create: [
            { name: "painel-geral", description: "Bate-papo livre e interações gerais da comunidade." },
            { name: "debates-e-estudos", description: "Artigos, filosofias, metodologias de estudo e debates intelectuais." },
            { name: "assistente-ia", description: "Chatbot inteligente integrado para suporte acadêmico e mentoria.", isBot: true }
          ]
        }
      },
    });

    return NextResponse.json(newCommunity);
  } catch (error: any) {
    console.error("Error creating community:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
