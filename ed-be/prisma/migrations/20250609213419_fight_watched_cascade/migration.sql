-- DropForeignKey
ALTER TABLE "FightWatched" DROP CONSTRAINT "FightWatched_playerId_fkey";

-- AddForeignKey
ALTER TABLE "FightWatched" ADD CONSTRAINT "FightWatched_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
