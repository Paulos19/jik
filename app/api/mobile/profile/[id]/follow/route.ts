import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const currentUserId = decoded.id;
    const { id: targetUserId } = await params;

    // The user to follow
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { nunuProfile: true }
    });

    if (!targetUser || !targetUser.nunuProfile) {
      return NextResponse.json({ error: "Target user or provider profile not found" }, { status: 404 });
    }

    const targetProviderId = targetUser.nunuProfile.id;

    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.nunuFollow.findFirst({
      where: {
        followerUserId: currentUserId,
        targetProviderId: targetProviderId
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.nunuFollow.delete({
        where: { id: existingFollow.id }
      });
      return NextResponse.json({ following: false });
    } else {
      // Follow
      await prisma.nunuFollow.create({
        data: {
          followerUserId: currentUserId,
          targetProviderId: targetProviderId
        }
      });
      return NextResponse.json({ following: true });
    }

  } catch (error) {
    console.error("POST /profile/[id]/follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
