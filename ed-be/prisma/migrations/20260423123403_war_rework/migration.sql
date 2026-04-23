/*
  Warnings:

  - The primary key for the `ClanWar` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `attackerId` on the `ClanWar` table. All the data in the column will be lost.
  - You are about to drop the column `attackerPWin` on the `ClanWar` table. All the data in the column will be lost.
  - You are about to drop the column `dateEnd` on the `ClanWar` table. All the data in the column will be lost.
  - You are about to drop the column `dateStart` on the `ClanWar` table. All the data in the column will be lost.
  - You are about to drop the column `defenderId` on the `ClanWar` table. All the data in the column will be lost.
  - You are about to drop the column `defenderPWin` on the `ClanWar` table. All the data in the column will be lost.
  - You are about to drop the column `losses` on the `clan_war_ranking` table. All the data in the column will be lost.
  - You are about to drop the column `totalPLost` on the `clan_war_ranking` table. All the data in the column will be lost.
  - You are about to drop the column `totalPWin` on the `clan_war_ranking` table. All the data in the column will be lost.
  - You are about to drop the column `totalRepLost` on the `clan_war_ranking` table. All the data in the column will be lost.
  - You are about to drop the column `wins` on the `clan_war_ranking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[attackerClanId]` on the table `ClanWar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[defenderClanId]` on the table `ClanWar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `attackerClanId` to the `ClanWar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defenderClanId` to the `ClanWar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endsAt` to the `ClanWar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `ClanWar` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `ClanWar` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ClanWar" DROP CONSTRAINT "ClanWar_attackerId_fkey";

-- DropForeignKey
ALTER TABLE "ClanWar" DROP CONSTRAINT "ClanWar_defenderId_fkey";

-- DropIndex
DROP INDEX "ClanWar_attackerId_key";

-- DropIndex
DROP INDEX "clan_war_ranking_clanId_key";

-- AlterTable
ALTER TABLE "ClanWar" DROP CONSTRAINT "ClanWar_pkey",
DROP COLUMN "attackerId",
DROP COLUMN "attackerPWin",
DROP COLUMN "dateEnd",
DROP COLUMN "dateStart",
DROP COLUMN "defenderId",
DROP COLUMN "defenderPWin",
ADD COLUMN     "attackerClanId" INTEGER NOT NULL,
ADD COLUMN     "defenderClanId" INTEGER NOT NULL,
ADD COLUMN     "endsAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eventId" UUID NOT NULL,
ADD COLUMN     "isCastleDestroyed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "winnerClanId" INTEGER,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "ClanWar_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "clan_war_ranking" DROP COLUMN "losses",
DROP COLUMN "totalPLost",
DROP COLUMN "totalPWin",
DROP COLUMN "totalRepLost",
DROP COLUMN "wins";

-- CreateIndex
CREATE UNIQUE INDEX "ClanWar_attackerClanId_key" ON "ClanWar"("attackerClanId");

-- CreateIndex
CREATE UNIQUE INDEX "ClanWar_defenderClanId_key" ON "ClanWar"("defenderClanId");

-- AddForeignKey
ALTER TABLE "ClanWar" ADD CONSTRAINT "ClanWar_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ClanEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanWar" ADD CONSTRAINT "ClanWar_attackerClanId_fkey" FOREIGN KEY ("attackerClanId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanWar" ADD CONSTRAINT "ClanWar_defenderClanId_fkey" FOREIGN KEY ("defenderClanId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanWar" ADD CONSTRAINT "ClanWar_winnerClanId_fkey" FOREIGN KEY ("winnerClanId") REFERENCES "Clan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
