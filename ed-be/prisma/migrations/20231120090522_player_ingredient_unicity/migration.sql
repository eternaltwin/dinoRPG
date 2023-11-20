/*
  Warnings:

  - A unique constraint covering the columns `[ingredientId,playerId]` on the table `player_ingredient` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "player_ingredient_ingredientId_playerId_key" ON "player_ingredient"("ingredientId", "playerId");
