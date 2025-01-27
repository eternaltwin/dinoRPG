/*
  Warnings:

  - A unique constraint covering the columns `[tournamentTeamId]` on the table `dojo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FightArchive" ADD COLUMN     "tournamentId" UUID,
ADD COLUMN     "tournamentStep" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "dojo" ADD COLUMN     "tournamentTeamId" UUID;

-- CreateTable
CREATE TABLE "Tournament" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "teamRace" TEXT NOT NULL,
    "levelLimit" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTeam" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "dojoId" UUID,
    "teamCount" INTEGER NOT NULL DEFAULT 1,
    "tournamentId" UUID,

    CONSTRAINT "TournamentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DinozToTournamentTeam" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_DinozToTournamentTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_id_key" ON "Tournament"("id");

-- CreateIndex
CREATE INDEX "Tournament_id_date_idx" ON "Tournament"("id", "date");

-- CreateIndex
CREATE INDEX "TournamentTeam_dojoId_idx" ON "TournamentTeam"("dojoId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeam_dojoId_tournamentId_key" ON "TournamentTeam"("dojoId", "tournamentId");

-- CreateIndex
CREATE INDEX "_DinozToTournamentTeam_B_index" ON "_DinozToTournamentTeam"("B");

-- CreateIndex
CREATE UNIQUE INDEX "dojo_tournamentTeamId_key" ON "dojo"("tournamentTeamId");

-- AddForeignKey
ALTER TABLE "dojo" ADD CONSTRAINT "dojo_tournamentTeamId_fkey" FOREIGN KEY ("tournamentTeamId") REFERENCES "TournamentTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DinozToTournamentTeam" ADD CONSTRAINT "_DinozToTournamentTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DinozToTournamentTeam" ADD CONSTRAINT "_DinozToTournamentTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "TournamentTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
