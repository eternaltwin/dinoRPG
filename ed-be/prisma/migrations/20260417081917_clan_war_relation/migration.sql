/*
  Warnings:

  - You are about to drop the column `clanWarId` on the `Clan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[attackerId]` on the table `ClanWar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `attackerId` to the `ClanWar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defenderId` to the `ClanWar` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Clan" DROP CONSTRAINT "Clan_clanWarId_fkey";

-- AlterTable
ALTER TABLE "Clan" DROP COLUMN "clanWarId";

-- AlterTable
ALTER TABLE "ClanWar" ADD COLUMN     "attackerId" INTEGER NOT NULL,
ADD COLUMN     "defenderId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ClanWar_attackerId_key" ON "ClanWar"("attackerId");

-- AddForeignKey
ALTER TABLE "ClanWar" ADD CONSTRAINT "ClanWar_attackerId_fkey" FOREIGN KEY ("attackerId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanWar" ADD CONSTRAINT "ClanWar_defenderId_fkey" FOREIGN KEY ("defenderId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
