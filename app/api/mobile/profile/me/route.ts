import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function GET(request: Request) {
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        nunuProfile: {
          include: {
            services: true,
            followers: true,
            following: true,
            posts: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get basic stats
    // followers: number of NunuFollow where targetProviderId === user.nunuProfile.id
    // following: number of NunuFollow where followerUserId === user.id
    
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

    // Get Recent Activity (e.g., recent posts + maybe comments)
    let recentActivity: any[] = [];
    if (user.nunuProfile?.posts) {
      recentActivity = user.nunuProfile.posts.map(post => ({
        id: post.id,
        type: 'post',
        title: 'Novo post publicado',
        timestamp: post.createdAt,
      }));
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        gender: user.gender,
        brandColor: user.brandColor,
        isProvider: user.nunuProfile?.isProvider || false,
        bio: user.nunuProfile?.bio || '',
        city: user.nunuProfile?.city || '',
        state: user.nunuProfile?.state || '',
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
      posts: user.nunuProfile?.posts || [],
      recentActivity
    });

  } catch (error) {
    console.error("GET /profile/me error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
