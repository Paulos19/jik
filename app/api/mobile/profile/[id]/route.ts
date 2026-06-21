import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        nunuProfile: {
          include: {
            services: true,
            posts: {
              take: 10,
              orderBy: { createdAt: 'desc' },
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let followersCount = 0;
    let followingCount = 0;
    let isFollowing = false;

    // We need to know who is requesting this to calculate `isFollowing`
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    let currentUserId = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded: any = jwt.verify(token, process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev");
        currentUserId = decoded.id;
      } catch (e) {
        // invalid token, ignore
      }
    }

    if (user.nunuProfile) {
      followersCount = await prisma.nunuFollow.count({
        where: { targetProviderId: user.nunuProfile.id }
      });
      followingCount = await prisma.nunuFollow.count({
        where: { followerUserId: user.id }
      });

      if (currentUserId) {
        const followRecord = await prisma.nunuFollow.findFirst({
          where: {
            followerUserId: currentUserId,
            targetProviderId: user.nunuProfile.id
          }
        });
        isFollowing = !!followRecord;
      }
    } else {
      followingCount = await prisma.nunuFollow.count({
        where: { followerUserId: user.id }
      });
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        image: user.image,
        brandColor: user.brandColor || "#FF4B72",
        isProvider: user.nunuProfile?.isProvider || false,
        bio: user.nunuProfile?.bio || "",
        city: user.nunuProfile?.city || "",
        state: user.nunuProfile?.state || "",
        rating: user.nunuProfile?.rating || 0,
        reviewCount: user.nunuProfile?.reviewCount || 0,
        providerId: user.nunuProfile?.id || null,
        isFollowing: isFollowing,
      },
      stats: {
        followers: followersCount,
        following: followingCount,
        posts: user.nunuProfile?.posts?.length || 0,
      },
      services: user.nunuProfile?.services || [],
      posts: user.nunuProfile?.posts || []
    });

  } catch (error) {
    console.error("GET /profile/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
