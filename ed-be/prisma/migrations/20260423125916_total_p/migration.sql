-- AlterTable
ALTER TABLE "clan_war_ranking" ADD COLUMN     "totalPLost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPWin" INTEGER NOT NULL DEFAULT 0;
