-- AlterTable
ALTER TABLE "NunuPost" ADD COLUMN     "originalPostId" TEXT;

-- AddForeignKey
ALTER TABLE "NunuPost" ADD CONSTRAINT "NunuPost_originalPostId_fkey" FOREIGN KEY ("originalPostId") REFERENCES "NunuPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
