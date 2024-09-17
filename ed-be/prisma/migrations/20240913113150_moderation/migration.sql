-- CreateEnum
CREATE TYPE "ModerationReason" AS ENUM ('multi', 'dinozName', 'accountName');

-- CreateTable
CREATE TABLE "Moderation" (
    "id" SERIAL NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "targetId" INTEGER NOT NULL,
    "dinozId" INTEGER,
    "reason" "ModerationReason" NOT NULL,
    "comment" TEXT NOT NULL,
    "sorted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Moderation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
