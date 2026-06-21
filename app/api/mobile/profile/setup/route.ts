import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    const userId = decoded.id;

    const { role, categories, state, city, latitude, longitude } = await request.json();

    const isProvider = role === "Prestador";

    // Build the category connections if provider
    let categoryUpdate = {};
    if (isProvider && categories && Array.isArray(categories)) {
      categoryUpdate = {
        categories: {
          connect: categories.map((catId: string) => ({ id: catId }))
        }
      };
    }

    const updatedProfile = await prisma.nunuProviderProfile.update({
      where: { userId },
      data: {
        isProvider,
        state: state || null,
        city: city || null,
        latitude: latitude || null,
        longitude: longitude || null,
        requirementsCompleted: true,
        ...categoryUpdate,
      },
      include: {
        categories: true,
        user: true,
      }
    });

    // Generate a new JWT token with updated profile information
    const newToken = jwt.sign(
      { 
        id: updatedProfile.user.id, 
        email: updatedProfile.user.email, 
        role: updatedProfile.user.role,
        nunuProvider: updatedProfile.isProvider,
        nunuRequirements: updatedProfile.requirementsCompleted
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      message: "Perfil atualizado com sucesso",
      token: newToken,
      profile: {
        isProvider: updatedProfile.isProvider,
        requirementsCompleted: updatedProfile.requirementsCompleted,
        state: updatedProfile.state,
        city: updatedProfile.city,
        categories: updatedProfile.categories,
      }
    });

  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
