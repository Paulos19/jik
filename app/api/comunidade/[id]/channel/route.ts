import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    // Find database user
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verify community existence and creator ownership
    const community = await prisma.community.findUnique({
      where: { id },
    });

    if (!community) {
      return NextResponse.json({ error: "Comunidade não encontrada" }, { status: 404 });
    }

    if (community.creatorId !== dbUser.id) {
      return NextResponse.json(
        { error: "Apenas o criador da comunidade pode adicionar canais" },
        { status: 403 }
      );
    }

    // Format channel name (similar to Discord, e.g., slugify or lowercase with hyphens)
    const formattedName = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    // Create the channel
    const newChannel = await prisma.communityChannel.create({
      data: {
        name: formattedName,
        description,
        isBot: false,
        communityId: id,
      },
    });

    return NextResponse.json(newChannel);
  } catch (error: any) {
    console.error("Error creating channel:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
