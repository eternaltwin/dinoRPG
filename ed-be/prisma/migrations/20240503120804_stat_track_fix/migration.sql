/*
  Warnings:

  - You are about to drop the `PlayerTracking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlayerTracking" DROP CONSTRAINT "PlayerTracking_playerId_fkey";

-- DropTable
DROP TABLE "PlayerTracking";

-- CreateTable
CREATE TABLE "playerTracking" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "stat" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "playerTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "playerTracking_stat_playerId_key" ON "playerTracking"("stat", "playerId");

-- AddForeignKey
ALTER TABLE "playerTracking" ADD CONSTRAINT "playerTracking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
