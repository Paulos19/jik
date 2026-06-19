"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ==========================================
// NEWS CARD ACTIONS
// ==========================================

export async function createNews(formData: FormData) {
  const session = await requireAdmin();

  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const content = (formData.get("content") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string) || null;
  const published = formData.get("published") === "on";

  if (!title || !summary) {
    return { error: "Título e resumo são obrigatórios." };
  }

  await prisma.newsCard.create({
    data: {
      title,
      summary,
      content,
      imageUrl,
      published,
      authorId: session.user!.id!,
    },
  });

  revalidatePath("/admin/noticias");
  redirect("/admin/noticias");
}

export async function updateNews(id: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const content = (formData.get("content") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string) || null;
  const published = formData.get("published") === "on";

  if (!title || !summary) {
    return { error: "Título e resumo são obrigatórios." };
  }

  await prisma.newsCard.update({
    where: { id },
    data: { title, summary, content, imageUrl, published },
  });

  revalidatePath("/admin/noticias");
}

export async function deleteNews(id: string) {
  await requireAdmin();
  await prisma.newsCard.delete({ where: { id } });
  revalidatePath("/admin/noticias");
}

export async function togglePublishNews(id: string) {
  await requireAdmin();
  const news = await prisma.newsCard.findUnique({ where: { id } });
  if (!news) return;

  await prisma.newsCard.update({
    where: { id },
    data: { published: !news.published },
  });
  revalidatePath("/admin/noticias");
}

// ==========================================
// HUB UPDATE ACTIONS
// ==========================================

export async function createHubUpdate(formData: FormData) {
  const session = await requireAdmin();

  const appName = formData.get("appName") as string;
  const version = (formData.get("version") as string) || null;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = (formData.get("type") as string) || "FEATURE";
  const published = formData.get("published") === "on";

  if (!appName || !title || !description) {
    return { error: "App, título e descrição são obrigatórios." };
  }

  await prisma.hubUpdate.create({
    data: {
      appName,
      version,
      title,
      description,
      type: type as any,
      published,
      authorId: session.user!.id!,
    },
  });

  revalidatePath("/admin/hub");
  redirect("/admin/hub");
}

export async function deleteHubUpdate(id: string) {
  await requireAdmin();
  await prisma.hubUpdate.delete({ where: { id } });
  revalidatePath("/admin/hub");
}

export async function togglePublishHubUpdate(id: string) {
  await requireAdmin();
  const update = await prisma.hubUpdate.findUnique({ where: { id } });
  if (!update) return;

  await prisma.hubUpdate.update({
    where: { id },
    data: { published: !update.published },
  });
  revalidatePath("/admin/hub");
}

// ==========================================
// FORUM MODERATION ACTIONS
// ==========================================

export async function togglePostPublished(id: string) {
  await requireAdmin();
  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) return;

  await prisma.forumPost.update({
    where: { id },
    data: { published: !post.published },
  });
  revalidatePath("/admin/forum");
}

export async function togglePostPinned(id: string) {
  await requireAdmin();
  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) return;

  await prisma.forumPost.update({
    where: { id },
    data: { pinned: !post.pinned },
  });
  revalidatePath("/admin/forum");
}

export async function togglePostLocked(id: string) {
  await requireAdmin();
  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) return;

  await prisma.forumPost.update({
    where: { id },
    data: { locked: !post.locked },
  });
  revalidatePath("/admin/forum");
}

export async function deletePost(id: string) {
  await requireAdmin();
  await prisma.forumPost.delete({ where: { id } });
  revalidatePath("/admin/forum");
}

// ==========================================
// FORUM CATEGORY ACTIONS
// ==========================================

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;
  const color = (formData.get("color") as string) || null;

  if (!name || !slug) {
    return { error: "Nome e slug são obrigatórios." };
  }

  const existing = await prisma.forumCategory.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Uma categoria com esse slug já existe." };
  }

  await prisma.forumCategory.create({
    data: { name, slug, description, color },
  });

  revalidatePath("/admin/forum/categorias");
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  // Check if category has posts
  const postsCount = await prisma.forumPost.count({
    where: { categoryId: id },
  });

  if (postsCount > 0) {
    return { error: `Não é possível excluir: ${postsCount} post(s) associados.` };
  }

  await prisma.forumCategory.delete({ where: { id } });
  revalidatePath("/admin/forum/categorias");
}
