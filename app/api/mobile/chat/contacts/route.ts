import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = decoded.id;

    // Check if user is provider
    const providerProfile = await prisma.nunuProviderProfile.findUnique({
      where: { userId }
    });

    const contactMap = new Map();

    // 1. Providers that this user follows
    const following = await prisma.nunuFollow.findMany({
      where: { followerUserId: userId },
      include: { targetProvider: { include: { user: true } } }
    });

    following.forEach(f => {
      if (f.targetProvider.user && f.targetProvider.user.id !== userId) {
        contactMap.set(f.targetProvider.user.id, {
          id: f.targetProvider.user.id,
          name: f.targetProvider.user.name || "Sem Nome",
          image: f.targetProvider.user.image,
        });
      }
    });

    // 2. If user is provider, users that follow them
    if (providerProfile) {
      const followers = await prisma.nunuFollow.findMany({
        where: { targetProviderId: providerProfile.id },
        include: { followerUser: true }
      });
      followers.forEach(f => {
        if (f.followerUser && f.followerUser.id !== userId) {
          contactMap.set(f.followerUser.id, {
            id: f.followerUser.id,
            name: f.followerUser.name || "Sem Nome",
            image: f.followerUser.image,
          });
        }
      });
    }

    // 3. For development, we might want to ensure there is at least one contact if testing.
    // In production, we just return the contacts.
    const contacts = Array.from(contactMap.values());

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
