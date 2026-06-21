import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function GET(request: Request) {
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

    const userId = decoded.id;

    // Buscar quem o usuário segue
    const follows = await prisma.nunuFollow.findMany({
      where: { followerUserId: userId },
      include: {
        targetProvider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    const friends = follows.map(f => ({
      id: f.targetProvider.user.id,
      name: f.targetProvider.user.name,
      avatar: f.targetProvider.user.image,
      providerId: f.targetProvider.id
    }));

    return NextResponse.json({ friends });

  } catch (error: any) {
    console.error("Friends Fetch Error:", error);
    return NextResponse.json({ error: "Erro ao buscar amigos" }, { status: 500 });
  }
}
