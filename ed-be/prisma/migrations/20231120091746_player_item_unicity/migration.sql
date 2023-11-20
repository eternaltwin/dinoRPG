/*
  Warnings:

  - A unique constraint covering the columns `[itemId,playerId]` on the table `player_item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "player_item_itemId_playerId_key" ON "player_item"("itemId", "playerId");
