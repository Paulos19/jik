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

    if (!decoded.nunuProvider) {
      return NextResponse.json({ error: "Acesso negado. Apenas prestadores." }, { status: 403 });
    }

    const { title, description, price, imageUrl, region } = await request.json();

    const providerProfile = await prisma.nunuProviderProfile.findUnique({
      where: { userId: decoded.id }
    });

    if (!providerProfile) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const service = await prisma.nunuService.create({
      data: {
        title,
        description,
        price: price ? parseFloat(price) : null,
        imageUrl,
        region,
        providerId: providerProfile.id
      }
    });

    return NextResponse.json({ message: "Serviço criado com sucesso", service });

  } catch (error: any) {
    console.error("Create Service Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(request: Request) {
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

    if (!decoded.nunuProvider) {
      return NextResponse.json({ error: "Acesso negado. Apenas prestadores." }, { status: 403 });
    }

    const providerProfile = await prisma.nunuProviderProfile.findUnique({
      where: { userId: decoded.id }
    });

    if (!providerProfile) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const services = await prisma.nunuService.findMany({
      where: { providerId: providerProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ services });

  } catch (error: any) {
    console.error("Get Services Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
