import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function PUT(request: Request) {
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
    const { name, bio, city, state, brandColor, image } = body;

    // Update User
    if (name || brandColor || image) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(brandColor && { brandColor }),
          ...(image && { image })
        }
      });
    }

    // Update or Create Provider Profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { nunuProfile: true }
    });

    if (user?.nunuProfile) {
      await prisma.nunuProviderProfile.update({
        where: { id: user.nunuProfile.id },
        data: {
          ...(bio !== undefined && { bio }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state })
        }
      });
    } else if (bio || city || state) {
      // If profile doesn't exist but fields are provided, create it
      await prisma.nunuProviderProfile.create({
        data: {
          userId,
          bio,
          city,
          state,
          isProvider: false
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("PUT /profile/update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
