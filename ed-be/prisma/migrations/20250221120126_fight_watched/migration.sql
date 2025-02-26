/*
  Warnings:

  - You are about to drop the column `currentTournamentStepWatched` on the `player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "player" DROP COLUMN "currentTournamentStepWatched";

-- CreateTable
CREATE TABLE "FightWatched" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "playerId" UUID NOT NULL,
    "favorite" BOOLEAN NOT NULL,
    "fightArchiveId" UUID NOT NULL,

    CONSTRAINT "FightWatched_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FightWatched_playerId_fightArchiveId_idx" ON "FightWatched"("playerId", "fightArchiveId");

-- CreateIndex
CREATE UNIQUE INDEX "FightWatched_playerId_fightArchiveId_key" ON "FightWatched"("playerId", "fightArchiveId");

-- AddForeignKey
ALTER TABLE "FightWatched" ADD CONSTRAINT "FightWatched_fightArchiveId_fkey" FOREIGN KEY ("fightArchiveId") REFERENCES "FightArchive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightWatched" ADD CONSTRAINT "FightWatched_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
