import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        nunuProfile: {
          include: {
            categories: true
          }
        }
      }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    // Check Nunu Profile
    let nunuProfile = user.nunuProfile;
    if (!nunuProfile) {
      nunuProfile = await prisma.nunuProviderProfile.create({
        data: {
          userId: user.id,
          isProvider: false,
          requirementsCompleted: false,
        },
        include: {
          categories: true
        }
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        image: user.image,
        name: user.name,
        nunuProvider: nunuProfile.isProvider,
        nunuRequirements: nunuProfile.requirementsCompleted
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        nunuProfile: {
          isProvider: nunuProfile.isProvider,
          requirementsCompleted: nunuProfile.requirementsCompleted,
          categories: nunuProfile.categories,
        }
      }
    });
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
