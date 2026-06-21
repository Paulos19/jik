-- CreateTable
CREATE TABLE "NunuCommentLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NunuCommentLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NunuNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientUserId" TEXT NOT NULL,
    "actorUserId" TEXT,

    CONSTRAINT "NunuNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NunuCommentLike_userId_commentId_key" ON "NunuCommentLike"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "NunuCommentLike" ADD CONSTRAINT "NunuCommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "NunuComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuCommentLike" ADD CONSTRAINT "NunuCommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuNotification" ADD CONSTRAINT "NunuNotification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NunuNotification" ADD CONSTRAINT "NunuNotification_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
