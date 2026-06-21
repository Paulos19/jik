-- CreateTable
CREATE TABLE "NunuCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NunuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NunuProviderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isProvider" BOOLEAN NOT NULL DEFAULT false,
    "requirementsCompleted" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "contactPhone" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NunuProviderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfileCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfileCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "NunuCategory_name_key" ON "NunuCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NunuProviderProfile_userId_key" ON "NunuProviderProfile"("userId");

-- CreateIndex
CREATE INDEX "_ProfileCategories_B_index" ON "_ProfileCategories"("B");

-- AddForeignKey
ALTER TABLE "NunuProviderProfile" ADD CONSTRAINT "NunuProviderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileCategories" ADD CONSTRAINT "_ProfileCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "NunuCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileCategories" ADD CONSTRAINT "_ProfileCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "NunuProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
