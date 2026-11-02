-- CreateTable
CREATE TABLE "clan_championship_fight" (
    "id" SERIAL NOT NULL,
    "matchId" UUID NOT NULL,
    "archiveId" UUID NOT NULL,
    "attackerClanId" INTEGER NOT NULL,
    "attackerWon" BOOLEAN NOT NULL,
    "participantDinozIds" INTEGER[],
    "participantPlayerIds" UUID[],
    "deadDinozIds" INTEGER[],
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clan_championship_fight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clan_championship_fight_archiveId_key" ON "clan_championship_fight"("archiveId");

-- CreateIndex
CREATE INDEX "clan_championship_fight_matchId_createdAt_idx" ON "clan_championship_fight"("matchId", "createdAt");

-- AddForeignKey
ALTER TABLE "clan_championship_fight" ADD CONSTRAINT "clan_championship_fight_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "clan_championship_match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
