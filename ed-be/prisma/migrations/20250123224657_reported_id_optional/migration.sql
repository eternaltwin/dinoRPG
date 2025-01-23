-- DropForeignKey
ALTER TABLE "Moderation" DROP CONSTRAINT "Moderation_reporterId_fkey";

-- AlterTable
ALTER TABLE "Moderation" ALTER COLUMN "reporterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
