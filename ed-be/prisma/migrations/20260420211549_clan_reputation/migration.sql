/*
  Warnings:

  - A unique constraint covering the columns `[clanId,eventId]` on the table `clan_war_ranking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clan_war_ranking" ADD COLUMN     "reputation" INTEGER NOT NULL DEFAULT 100;

-- CreateIndex
CREATE INDEX "clan_war_ranking_eventId_reputation_idx" ON "clan_war_ranking"("eventId", "reputation");

-- CreateIndex
CREATE UNIQUE INDEX "clan_war_ranking_clanId_eventId_key" ON "clan_war_ranking"("clanId", "eventId");
