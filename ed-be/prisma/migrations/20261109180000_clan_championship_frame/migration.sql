-- CreateTable
CREATE TABLE "clan_championship_frame" (
    "id" SERIAL NOT NULL,
    "matchId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "events" JSONB NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "ticksApplied" INTEGER NOT NULL,
    "pieces" JSONB NOT NULL,

    CONSTRAINT "clan_championship_frame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clan_championship_frame_matchId_version_key" ON "clan_championship_frame"("matchId", "version");

-- AddForeignKey
ALTER TABLE "clan_championship_frame" ADD CONSTRAINT "clan_championship_frame_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "clan_championship_match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
