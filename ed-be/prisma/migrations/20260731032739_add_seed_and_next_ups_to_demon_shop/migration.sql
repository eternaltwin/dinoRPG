/*
  Warnings:

  - Added the required column `nextUpAltElementId` to the `player_demon_shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextUpElementId` to the `player_demon_shop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "player_demon_shop" ADD COLUMN     "nextUpAltElementId" INTEGER NOT NULL,
ADD COLUMN     "nextUpElementId" INTEGER NOT NULL,
ADD COLUMN     "seed" TEXT NOT NULL DEFAULT uuid_generate_v4();
