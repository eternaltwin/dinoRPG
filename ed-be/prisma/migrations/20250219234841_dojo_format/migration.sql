-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "formatName" TEXT NOT NULL DEFAULT 'ffa',
ADD COLUMN     "poison" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "raceMinimum" INTEGER NOT NULL DEFAULT 1;
