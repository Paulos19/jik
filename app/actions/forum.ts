"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createPostAction(formData: FormData) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return { error: "Você precisa estar logado para publicar." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") as string;
  const imageUrl = formData.get("imageUrl") as string | null;

  if (!title || !content || !categoryId) {
    return { error: "Todos os campos são obrigatórios." };
  }

  try {
    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        categoryId,
        authorId: session.user.id,
        published: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/forum");
    return { success: true, post };
  } catch (error) {
    console.error("Erro ao criar post:", error);
    return { error: "Ocorreu um erro ao criar o post." };
  }
}
