-- CreateTable
CREATE TABLE "CommunityChannel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "communityId" TEXT NOT NULL,

    CONSTRAINT "CommunityChannel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommunityChannel" ADD CONSTRAINT "CommunityChannel_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
