"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileImageAction(imageUrl: string) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { error: "Você precisa estar logado para atualizar sua foto de perfil." };
  }

  if (!imageUrl) {
    return { error: "URL da imagem inválida." };
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    revalidatePath("/perfil");
    revalidatePath("/");
    return { success: true, user };
  } catch (error) {
    console.error("Erro ao atualizar foto de perfil:", error);
    return { error: "Ocorreu um erro ao atualizar a foto de perfil." };
  }
}

export async function updateUserDetailsAction(name: string) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { error: "Você precisa estar logado para atualizar seus dados." };
  }

  if (!name || name.trim().length === 0) {
    return { error: "O nome não pode estar vazio." };
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    });

    revalidatePath("/perfil");
    revalidatePath("/");
    return { success: true, user };
  } catch (error) {
    console.error("Erro ao atualizar dados do perfil:", error);
    return { error: "Ocorreu um erro ao atualizar os dados." };
  }
}
