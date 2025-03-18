-- AlterTable
ALTER TABLE "FightArchive" ADD COLUMN     "FBTournamentLeftId" INTEGER,
ADD COLUMN     "FBTournamentRightId" INTEGER;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_FBTournamentLeftId_fkey" FOREIGN KEY ("FBTournamentLeftId") REFERENCES "gamedinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_FBTournamentRightId_fkey" FOREIGN KEY ("FBTournamentRightId") REFERENCES "gamedinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
