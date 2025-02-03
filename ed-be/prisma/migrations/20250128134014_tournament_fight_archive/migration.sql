-- AlterTable
ALTER TABLE "FightArchive" ADD COLUMN     "tournamentTeamLeftId" UUID,
ADD COLUMN     "tournamentTeamRightId" UUID;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_tournamentTeamLeftId_fkey" FOREIGN KEY ("tournamentTeamLeftId") REFERENCES "TournamentTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_tournamentTeamRightId_fkey" FOREIGN KEY ("tournamentTeamRightId") REFERENCES "TournamentTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
