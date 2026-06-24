import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;
    const body = await request.json();
    const { title, description, price, region, categoryId, imageUrl } = body;
    const resolvedParams = await params;
    const serviceId = resolvedParams.id;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { nunuProfile: true }
    });

    const providerId = user?.nunuProfile?.id;

    if (!providerId) {
      return NextResponse.json({ error: "Not a provider" }, { status: 403 });
    }

    const existingService = await prisma.nunuService.findUnique({
      where: { id: serviceId }
    });

    if (!existingService || existingService.providerId !== providerId) {
      return NextResponse.json({ error: "Service not found or access denied" }, { status: 404 });
    }

    // Ensure category exists
    if (categoryId) {
      const categoryExists = await prisma.nunuCategory.findUnique({ where: { id: categoryId }});
      if (!categoryExists) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    const updatedService = await prisma.nunuService.update({
      where: { id: serviceId },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : null,
        region,
        imageUrl,
      }
    });

    if (categoryId) {
      await prisma.nunuProviderProfile.update({
        where: { id: providerId },
        data: {
          categories: {
            connect: { id: categoryId }
          }
        }
      });
    }

    return NextResponse.json({ success: true, service: updatedService });

  } catch (error) {
    console.error("PUT /services/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
