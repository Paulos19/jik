-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('VIDEO', 'IMAGE');

-- CreateTable
CREATE TABLE "NunuService" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "providerId" TEXT NOT NULL,

    CONSTRAINT "NunuService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NunuPost" (
    "id" TEXT NOT NULL,
    "caption" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL DEFAULT 'VIDEO',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "serviceId" TEXT,

    CONSTRAINT "NunuPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NunuLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NunuLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NunuComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NunuComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NunuFollow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followerUserId" TEXT NOT NULL,
    "targetProviderId" TEXT NOT NULL,
    "sourceProviderId" TEXT,

    CONSTRAINT "NunuFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NunuReport" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NunuReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NunuLike_postId_userId_key" ON "NunuLike"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "NunuFollow_followerUserId_targetProviderId_key" ON "NunuFollow"("followerUserId", "targetProviderId");

-- AddForeignKey
ALTER TABLE "NunuService" ADD CONSTRAINT "NunuService_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "NunuProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuPost" ADD CONSTRAINT "NunuPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "NunuProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuPost" ADD CONSTRAINT "NunuPost_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "NunuService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuLike" ADD CONSTRAINT "NunuLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "NunuPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuLike" ADD CONSTRAINT "NunuLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuComment" ADD CONSTRAINT "NunuComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "NunuPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuComment" ADD CONSTRAINT "NunuComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuFollow" ADD CONSTRAINT "NunuFollow_followerUserId_fkey" FOREIGN KEY ("followerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuFollow" ADD CONSTRAINT "NunuFollow_targetProviderId_fkey" FOREIGN KEY ("targetProviderId") REFERENCES "NunuProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuFollow" ADD CONSTRAINT "NunuFollow_sourceProviderId_fkey" FOREIGN KEY ("sourceProviderId") REFERENCES "NunuProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuReport" ADD CONSTRAINT "NunuReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "NunuPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuReport" ADD CONSTRAINT "NunuReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
