-- CreateEnum
CREATE TYPE "GameDinozUsage" AS ENUM ('FBTournament');

-- AlterTable
ALTER TABLE "FightArchive" ADD COLUMN     "FBTournamentId" UUID;

-- AlterTable
ALTER TABLE "dinoz_item" ADD COLUMN     "gameDinozId" INTEGER;

-- AlterTable
ALTER TABLE "dinoz_items_dinoz_item" ADD COLUMN     "gameDinozId" INTEGER;

-- AlterTable
ALTER TABLE "dinoz_skill" ADD COLUMN     "gameDinozId" INTEGER;

-- AlterTable
ALTER TABLE "dinoz_skill_unlockable" ADD COLUMN     "gameDinozId" INTEGER;

-- CreateTable
CREATE TABLE "FBTournament" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamRace" TEXT NOT NULL,
    "levelLimit" INTEGER NOT NULL DEFAULT 50,
    "cashPrice" INTEGER NOT NULL DEFAULT 0,
    "nextRound" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FBTournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamedinoz" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "raceId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "nextUpElementId" INTEGER NOT NULL,
    "nextUpAltElementId" INTEGER NOT NULL,
    "display" VARCHAR NOT NULL,
    "life" INTEGER NOT NULL,
    "maxLife" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,
    "nbrUpFire" INTEGER NOT NULL,
    "nbrUpWood" INTEGER NOT NULL,
    "nbrUpWater" INTEGER NOT NULL,
    "nbrUpLightning" INTEGER NOT NULL,
    "nbrUpAir" INTEGER NOT NULL,
    "createdDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seed" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "usage" "GameDinozUsage" NOT NULL,
    "playerId" UUID,
    "FBTournamentId" UUID,

    CONSTRAINT "gamedinoz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FBTournament_id_key" ON "FBTournament"("id");

-- CreateIndex
CREATE INDEX "FBTournament_id_date_idx" ON "FBTournament"("id", "date");

-- CreateIndex
CREATE INDEX "gamedinoz_usage_idx" ON "gamedinoz"("usage");

-- AddForeignKey
ALTER TABLE "dinoz_item" ADD CONSTRAINT "dinoz_item_gameDinozId_fkey" FOREIGN KEY ("gameDinozId") REFERENCES "gamedinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dinoz_items_dinoz_item" ADD CONSTRAINT "dinoz_items_dinoz_item_gameDinozId_fkey" FOREIGN KEY ("gameDinozId") REFERENCES "gamedinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dinoz_skill" ADD CONSTRAINT "dinoz_skill_gameDinozId_fkey" FOREIGN KEY ("gameDinozId") REFERENCES "gamedinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dinoz_skill_unlockable" ADD CONSTRAINT "dinoz_skill_unlockable_gameDinozId_fkey" FOREIGN KEY ("gameDinozId") REFERENCES "gamedinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_FBTournamentId_fkey" FOREIGN KEY ("FBTournamentId") REFERENCES "FBTournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamedinoz" ADD CONSTRAINT "FK_064135f23ecaf0207af9926d7c9" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gamedinoz" ADD CONSTRAINT "gamedinoz_FBTournamentId_fkey" FOREIGN KEY ("FBTournamentId") REFERENCES "FBTournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;
