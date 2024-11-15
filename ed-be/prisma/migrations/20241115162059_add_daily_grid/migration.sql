-- AlterEnum
ALTER TYPE "LogType" ADD VALUE 'GridFinished';

-- AlterTable
ALTER TABLE "player" ADD COLUMN     "dailyGridRewards" INTEGER NOT NULL DEFAULT 0;
