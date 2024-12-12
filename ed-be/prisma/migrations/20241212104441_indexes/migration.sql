-- CreateIndex
CREATE INDEX "ClanMember_clanId_idx" ON "ClanMember"("clanId");

-- CreateIndex
CREATE INDEX "ClanPage_clanId_idx" ON "ClanPage"("clanId");

-- CreateIndex
CREATE INDEX "Log_playerId_dinozId_type_idx" ON "Log"("playerId", "dinozId", "type");

-- CreateIndex
CREATE INDEX "UsernameHistory_playerId_idx" ON "UsernameHistory"("playerId");

-- CreateIndex
CREATE INDEX "clan_messages_clanId_idx" ON "clan_messages"("clanId");

-- CreateIndex
CREATE INDEX "idx_playerId" ON "dinoz"("playerId");

-- CreateIndex
CREATE INDEX "dinoz_item_dinozId_idx" ON "dinoz_item"("dinozId");

-- CreateIndex
CREATE INDEX "dinoz_mission_dinozId_idx" ON "dinoz_mission"("dinozId");

-- CreateIndex
CREATE INDEX "dinoz_skill_dinozId_idx" ON "dinoz_skill"("dinozId");

-- CreateIndex
CREATE INDEX "dinoz_status_dinozId_idx" ON "dinoz_status"("dinozId");

-- CreateIndex
CREATE INDEX "npc_dinozId_idx" ON "npc"("dinozId");

-- CreateIndex
CREATE INDEX "playerTracking_playerId_idx" ON "playerTracking"("playerId");

-- CreateIndex
CREATE INDEX "player_gather_playerId_idx" ON "player_gather"("playerId");

-- CreateIndex
CREATE INDEX "player_ingredient_playerId_idx" ON "player_ingredient"("playerId");

-- CreateIndex
CREATE INDEX "player_item_playerId_idx" ON "player_item"("playerId");

-- CreateIndex
CREATE INDEX "ranking_playerId_idx" ON "ranking"("playerId");
