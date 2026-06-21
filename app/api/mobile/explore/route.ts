import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Busca Categorias Ativas
    const categories = await prisma.nunuCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    // Busca Serviços recentes com info do provedor
    const services = await prisma.nunuService.findMany({
      where: { isActive: true },
      include: {
        provider: {
          select: {
            rating: true,
            reviewCount: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limite para mobile
    });

    // Busca Notícias / Banners para o hub
    const newsCards = await prisma.newsCard.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    const heroBanner = newsCards.length > 0 ? newsCards[0] : null;
    const newsBanner = newsCards.length > 1 ? newsCards[1] : null;

    return NextResponse.json({
      categories,
      services,
      heroBanner,
      newsBanner,
    });

  } catch (error) {
    console.error("GET /api/mobile/explore error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
