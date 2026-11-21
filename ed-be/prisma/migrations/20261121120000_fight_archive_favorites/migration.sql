-- DropForeignKey
ALTER TABLE "FightWatched" DROP CONSTRAINT "FightWatched_fightArchiveId_fkey";

-- AlterTable
ALTER TABLE "FightWatched" ADD COLUMN     "favoriteDate" TIMESTAMP(6);

-- CreateIndex
CREATE INDEX "FightArchive_createdDate_idx" ON "FightArchive"("createdDate");

-- CreateIndex
CREATE INDEX "FightArchive_leftPlayerId_createdDate_idx" ON "FightArchive"("leftPlayerId", "createdDate");

-- CreateIndex
CREATE INDEX "FightArchive_rightPlayerId_createdDate_idx" ON "FightArchive"("rightPlayerId", "createdDate");

-- CreateIndex
CREATE INDEX "FightWatched_playerId_favorite_idx" ON "FightWatched"("playerId", "favorite");

-- CreateIndex
CREATE INDEX "FightWatched_fightArchiveId_favorite_idx" ON "FightWatched"("fightArchiveId", "favorite");

-- AddForeignKey
ALTER TABLE "FightWatched" ADD CONSTRAINT "FightWatched_fightArchiveId_fkey" FOREIGN KEY ("fightArchiveId") REFERENCES "FightArchive"("id") ON DELETE CASCADE ON UPDATE CASCADE;

