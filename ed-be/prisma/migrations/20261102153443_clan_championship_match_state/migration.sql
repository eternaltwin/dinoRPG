/*
  Warnings:

  - Added the required column `awayClanName` to the `clan_championship_match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeClanName` to the `clan_championship_match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clanName` to the `clan_championship_registration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClanChampionshipMatchStatus" AS ENUM ('scheduled', 'live', 'finished');

-- CreateEnum
CREATE TYPE "ClanChampionshipPieceState" AS ENUM ('onBoard', 'left', 'dead');

-- AlterEnum
ALTER TYPE "UnavailableReason" ADD VALUE 'clanChampionship';

-- DropForeignKey
ALTER TABLE "clan_championship_match" DROP CONSTRAINT "clan_championship_match_awayClanId_fkey";

-- DropForeignKey
ALTER TABLE "clan_championship_match" DROP CONSTRAINT "clan_championship_match_homeClanId_fkey";

-- DropForeignKey
ALTER TABLE "clan_championship_registration" DROP CONSTRAINT "clan_championship_registration_clanId_fkey";

-- AlterTable
ALTER TABLE "clan_championship_match" ADD COLUMN     "awayClanName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "awayScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "homeClanName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "homeScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "obstacles" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "placeId" INTEGER,
ADD COLUMN     "status" "ClanChampionshipMatchStatus" NOT NULL DEFAULT 'scheduled',
ADD COLUMN     "ticksApplied" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "westClanId" INTEGER,
ADD COLUMN     "winnerClanId" INTEGER,
ALTER COLUMN "homeClanId" DROP NOT NULL,
ALTER COLUMN "awayClanId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "clan_championship_registration" ADD COLUMN     "clanName" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "clanId" DROP NOT NULL;

-- Backfill the name snapshots from the existing clans, then drop the temporary defaults
UPDATE "clan_championship_registration" r SET "clanName" = c."name" FROM "Clan" c WHERE c."id" = r."clanId";
UPDATE "clan_championship_match" m SET "homeClanName" = c."name" FROM "Clan" c WHERE c."id" = m."homeClanId";
UPDATE "clan_championship_match" m SET "awayClanName" = c."name" FROM "Clan" c WHERE c."id" = m."awayClanId";
ALTER TABLE "clan_championship_registration" ALTER COLUMN "clanName" DROP DEFAULT;
ALTER TABLE "clan_championship_match" ALTER COLUMN "homeClanName" DROP DEFAULT, ALTER COLUMN "awayClanName" DROP DEFAULT;

-- CreateTable
CREATE TABLE "clan_championship_piece" (
    "id" SERIAL NOT NULL,
    "matchId" UUID NOT NULL,
    "dinozId" INTEGER NOT NULL,
    "playerId" UUID NOT NULL,
    "clanId" INTEGER NOT NULL,
    "state" "ClanChampionshipPieceState" NOT NULL DEFAULT 'onBoard',
    "x" INTEGER,
    "y" INTEGER,
    "actionPoints" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clan_championship_piece_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clan_championship_piece_matchId_state_idx" ON "clan_championship_piece"("matchId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "clan_championship_piece_matchId_dinozId_key" ON "clan_championship_piece"("matchId", "dinozId");

-- AddForeignKey
ALTER TABLE "clan_championship_registration" ADD CONSTRAINT "clan_championship_registration_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_championship_match" ADD CONSTRAINT "clan_championship_match_homeClanId_fkey" FOREIGN KEY ("homeClanId") REFERENCES "Clan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_championship_match" ADD CONSTRAINT "clan_championship_match_awayClanId_fkey" FOREIGN KEY ("awayClanId") REFERENCES "Clan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_championship_piece" ADD CONSTRAINT "clan_championship_piece_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "clan_championship_match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_championship_piece" ADD CONSTRAINT "clan_championship_piece_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
