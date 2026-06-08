-- CreateIndex
CREATE INDEX "ClanWar_startedAt_idx" ON "ClanWar"("startedAt" DESC);

-- CreateIndex
CREATE INDEX "ClanWar_attackerClanId_idx" ON "ClanWar"("attackerClanId");

-- CreateIndex
CREATE INDEX "ClanWar_defenderClanId_idx" ON "ClanWar"("defenderClanId");

-- CreateIndex
CREATE INDEX "Log_type_idx" ON "Log"("type");

-- CreateIndex
CREATE INDEX "Log_values_idx" ON "Log" USING GIN ("values");
