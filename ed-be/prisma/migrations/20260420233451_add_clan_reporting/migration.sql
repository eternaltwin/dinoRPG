-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ModerationReason" ADD VALUE 'other';
ALTER TYPE "ModerationReason" ADD VALUE 'clanBanner';
ALTER TYPE "ModerationReason" ADD VALUE 'clanBehavior';
ALTER TYPE "ModerationReason" ADD VALUE 'clanPages';
ALTER TYPE "ModerationReason" ADD VALUE 'clanOther';

-- AlterTable
ALTER TABLE "Moderation" ADD COLUMN     "targetClanId" INTEGER;

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_targetClanId_fkey" FOREIGN KEY ("targetClanId") REFERENCES "Clan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
