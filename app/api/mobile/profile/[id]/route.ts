import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: userId } = params;

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

    if (user.nunuProfile) {
      followersCount = await prisma.nunuFollow.count({
        where: { targetProviderId: user.nunuProfile.id }
      });
      followingCount = await prisma.nunuFollow.count({
        where: { followerUserId: user.id }
      });
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
