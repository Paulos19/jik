import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function POST(request: Request) {
  try {
    const { name, email, password, gender, brandColor } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "E-mail já está em uso." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender,
        brandColor: brandColor || "#FF4B72",
        nunuProfile: {
          create: {
            isProvider: false,
            requirementsCompleted: false,
          }
        }
      },
      include: {
        nunuProfile: true
      }
    });

    const nunuProfile = user.nunuProfile!;

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        image: user.image,
        name: user.name,
        brandColor: user.brandColor,
        nunuProvider: nunuProfile.isProvider,
        nunuRequirements: nunuProfile.requirementsCompleted
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Erro ao criar conta." }, { status: 500 });
  }
}
