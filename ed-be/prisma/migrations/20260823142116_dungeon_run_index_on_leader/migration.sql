/*
  Warnings:

  - A unique constraint covering the columns `[leaderId]` on the table `dungeon_run` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "dungeon_run_leaderId_key" ON "dungeon_run"("leaderId");
