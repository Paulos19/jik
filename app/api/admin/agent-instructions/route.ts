import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const instruction = await prisma.agentInstruction.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({
      content: instruction?.content || "Nenhuma instrução adicional do administrador cadastrada ainda.",
    });
  } catch (error: any) {
    console.error("Error fetching agent instructions:", error);
    return NextResponse.json(
      { error: "Erro ao buscar instruções do assistente", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content } = body;

    if (content === undefined || typeof content !== "string") {
      return NextResponse.json(
        { error: "Conteúdo inválido. Deve ser uma string." },
        { status: 400 }
      );
    }

    const instruction = await prisma.agentInstruction.upsert({
      where: { id: "default" },
      update: { content },
      create: { id: "default", content },
    });

    return NextResponse.json({
      success: true,
      content: instruction.content,
    });
  } catch (error: any) {
    console.error("Error updating agent instructions:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar instruções do assistente", details: error.message },
      { status: 500 }
    );
  }
}
