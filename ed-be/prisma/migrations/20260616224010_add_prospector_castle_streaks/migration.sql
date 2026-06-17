-- AlterEnum
ALTER TYPE "ServerAction" ADD VALUE 'prospector';

-- AlterTable
ALTER TABLE "clan_war_ranking" ADD COLUMN     "castleDownStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "castleStandingStreak" INTEGER NOT NULL DEFAULT 0;
