/*
  Warnings:

  - Added the required column `points` to the `ClanWar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClanWar" ADD COLUMN     "points" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "clan_war_ranking" (
    "id" SERIAL NOT NULL,
    "clanId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "eventId" UUID NOT NULL,

    CONSTRAINT "clan_war_ranking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clan_war_ranking_clanId_key" ON "clan_war_ranking"("clanId");

-- CreateIndex
CREATE INDEX "clan_war_ranking_eventId_points_idx" ON "clan_war_ranking"("eventId", "points");

-- AddForeignKey
ALTER TABLE "clan_war_ranking" ADD CONSTRAINT "clan_war_ranking_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_war_ranking" ADD CONSTRAINT "clan_war_ranking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ClanEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
