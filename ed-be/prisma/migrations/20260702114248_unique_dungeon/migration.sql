/*
  Warnings:

  - A unique constraint covering the columns `[playerId,dungeonId]` on the table `dungeon_run` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "dungeon_run_playerId_idx";

-- CreateIndex
CREATE INDEX "dungeon_run_playerId_dungeonId_idx" ON "dungeon_run"("playerId", "dungeonId");

-- CreateIndex
CREATE UNIQUE INDEX "dungeon_run_playerId_dungeonId_key" ON "dungeon_run"("playerId", "dungeonId");
