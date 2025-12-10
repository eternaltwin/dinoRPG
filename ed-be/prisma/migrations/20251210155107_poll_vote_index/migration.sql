-- CreateIndex
CREATE INDEX "poll_votes_pollId_playerId_idx" ON "poll_votes"("pollId", "playerId");
