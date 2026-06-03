-- CreateTable
CREATE TABLE "clan_castle_repair" (
    "id" SERIAL NOT NULL,
    "castleId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(6) NOT NULL,
    "hpPerTick" INTEGER NOT NULL,
    "frequency" INTEGER NOT NULL,
    "totalTicks" INTEGER NOT NULL,
    "appliedTicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clan_castle_repair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clan_castle_repair_castleId_idx" ON "clan_castle_repair"("castleId");

-- AddForeignKey
ALTER TABLE "clan_castle_repair" ADD CONSTRAINT "clan_castle_repair_castleId_fkey" FOREIGN KEY ("castleId") REFERENCES "ClanCastle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
