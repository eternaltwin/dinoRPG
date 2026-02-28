-- CreateIndex
CREATE INDEX "FightArchive_tournamentId_tournamentStep_idx" ON "FightArchive"("tournamentId", "tournamentStep");

-- CreateIndex
CREATE INDEX "dinoz_following_idx" ON "dinoz"("following");

-- CreateIndex
CREATE INDEX "player_quest_playerId_idx" ON "player_quest"("playerId");

-- CreateIndex
CREATE INDEX "player_reward_playerId_idx" ON "player_reward"("playerId");
