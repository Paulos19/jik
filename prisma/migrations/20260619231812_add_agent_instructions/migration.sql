-- CreateTable
CREATE TABLE "AgentInstruction" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentInstruction_pkey" PRIMARY KEY ("id")
);
