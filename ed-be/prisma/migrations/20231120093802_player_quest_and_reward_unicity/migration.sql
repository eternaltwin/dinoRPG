/*
  Warnings:

  - A unique constraint covering the columns `[questId,playerId]` on the table `player_quest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rewardId,playerId]` on the table `player_reward` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "player_quest_questId_playerId_key" ON "player_quest"("questId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "player_reward_rewardId_playerId_key" ON "player_reward"("rewardId", "playerId");
