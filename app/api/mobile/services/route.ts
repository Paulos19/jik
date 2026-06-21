import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function POST(request: Request) {
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
    const { title, description, price, region, categoryId } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { nunuProfile: true }
    });

    let providerId = user?.nunuProfile?.id;

    // If user is not a provider yet, create the profile
    if (!providerId) {
      const newProfile = await prisma.nunuProviderProfile.create({
        data: {
          userId,
          isProvider: true,
        }
      });
      providerId = newProfile.id;
    } else if (!user?.nunuProfile?.isProvider) {
      // Mark as provider
      await prisma.nunuProviderProfile.update({
        where: { id: providerId },
        data: { isProvider: true }
      });
    }

    // Ensure category exists
    if (categoryId) {
      const categoryExists = await prisma.nunuCategory.findUnique({ where: { id: categoryId }});
      if (!categoryExists) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    const newService = await prisma.nunuService.create({
      data: {
        title,
        description,
        price: price ? parseFloat(price) : null,
        region,
        providerId: providerId,
      }
    });

    // Optionally connect category to provider profile if they add a service from it
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

    return NextResponse.json({ success: true, service: newService });

  } catch (error) {
    console.error("POST /services error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
