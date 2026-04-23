/*
  Warnings:

  - You are about to drop the column `points` on the `ClanWar` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `clan_war_ranking` table. All the data in the column will be lost.
  - Added the required column `attackerPWin` to the `ClanWar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defenderPWin` to the `ClanWar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `clan_war_ranking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "clan_war_ranking_eventId_points_idx";

-- AlterTable
ALTER TABLE "ClanWar" DROP COLUMN "points",
ADD COLUMN     "attackerPWin" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "defenderPWin" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "clan_war_ranking" DROP COLUMN "points",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "downtimeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPLost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalPWin" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalRepLost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "reputation" SET DEFAULT 100,
ALTER COLUMN "reputation" SET DATA TYPE DOUBLE PRECISION;
