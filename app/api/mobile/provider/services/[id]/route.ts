import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { title, description, price, imageUrl, region, categoryId } = await request.json();
    const resolvedParams = await params;
    const serviceId = resolvedParams.id;

    const providerProfile = await prisma.nunuProviderProfile.findUnique({
      where: { userId: decoded.id }
    });

    if (!providerProfile) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const existingService = await prisma.nunuService.findUnique({
      where: { id: serviceId }
    });

    if (!existingService || existingService.providerId !== providerProfile.id) {
      return NextResponse.json({ error: "Serviço não encontrado ou acesso negado." }, { status: 404 });
    }

    const service = await prisma.nunuService.update({
      where: { id: serviceId },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : null,
        imageUrl,
        region,
      }
    });

    if (categoryId) {
      await prisma.nunuProviderProfile.update({
        where: { id: providerProfile.id },
        data: {
          categories: {
            connect: { id: categoryId }
          }
        }
      });
    }

    return NextResponse.json({ message: "Serviço atualizado com sucesso", service });

  } catch (error: any) {
    console.error("Update Service Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
