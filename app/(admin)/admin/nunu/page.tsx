import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import NunuClient from "./nunu-client";

export default async function NunuConfigPage() {
  await requireAdmin();

  const categories = await prisma.nunuCategory.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <NunuClient initialCategories={categories} />;
}
