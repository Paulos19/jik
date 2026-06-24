import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return NextResponse.json({ error: "Token não fornecido." }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    const { mediaUrl, mediaType, caption, serviceId } = await request.json();

    const providerProfile = await prisma.nunuProviderProfile.findUnique({
      where: { userId: decoded.id }
    });

    if (!providerProfile || !providerProfile.isProvider) {
      return NextResponse.json({ error: "Acesso negado. Apenas prestadores." }, { status: 403 });
    }

    const post = await prisma.nunuPost.create({
      data: {
        mediaUrl,
        mediaType: mediaType || "VIDEO",
        caption,
        authorId: providerProfile.id,
        serviceId: serviceId || null,
      }
    });

    return NextResponse.json({ message: "Postagem criada com sucesso", post });

  } catch (error: any) {
    console.error("Create Post Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
