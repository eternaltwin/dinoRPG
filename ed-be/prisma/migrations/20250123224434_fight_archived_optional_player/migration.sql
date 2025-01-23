-- DropForeignKey
ALTER TABLE "FightArchive" DROP CONSTRAINT "FightArchive_playerId_fkey";

-- AlterTable
ALTER TABLE "FightArchive" ALTER COLUMN "playerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
