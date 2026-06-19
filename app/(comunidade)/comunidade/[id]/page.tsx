import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import ComunidadeInternaClient from "@/components/comunidade-interna-client";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComunidadeDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch the real community from the database with channels and creator
  const community = await prisma.community.findUnique({
    where: { id },
    include: { channels: true, creator: true }
  });

  if (!community) {
    notFound();
  }

  const serializedCommunity = {
    id: community.id,
    name: community.name,
    description: community.description,
    type: community.type as "public" | "restricted",
    memberCount: community.memberCount,
    tags: community.tags,
    bannerGradient: community.bannerGradient || "from-[#336E72]/20 to-neutral-900",
    creatorId: community.creatorId,
    creatorName: community.creator.name,
    channels: community.channels.map(ch => ({
      id: ch.id,
      name: ch.name,
      description: ch.description,
      isBot: ch.isBot
    }))
  };

  // Find database user to pass real id and info
  let dbUser = null;
  if (session.user.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, image: true }
    });
  }

  return (
    <ComunidadeInternaClient
      communityId={id}
      user={dbUser || session.user}
      initialCommunity={serializedCommunity}
    />
  );
}
