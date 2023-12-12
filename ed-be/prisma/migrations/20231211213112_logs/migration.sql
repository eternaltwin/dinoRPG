/*
  Warnings:

  - You are about to drop the column `missionId` on the `dinoz` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('ItemUsed', 'ItemBought', 'GoldWon', 'GoldLost', 'Move', 'LevelUp', 'Fight', 'Death', 'Revive', 'MissionStep', 'MissionFinished', 'Gather', 'CreateDinoz');

-- AlterTable
ALTER TABLE "dinoz" DROP COLUMN "missionId";

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "dinozId" INTEGER,
    "type" "LogType" NOT NULL,
    "values" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
