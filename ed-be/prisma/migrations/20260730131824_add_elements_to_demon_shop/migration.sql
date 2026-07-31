/*
  Warnings:

  - Added the required column `nbrUpAir` to the `player_demon_shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nbrUpFire` to the `player_demon_shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nbrUpLightning` to the `player_demon_shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nbrUpWater` to the `player_demon_shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nbrUpWood` to the `player_demon_shop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "player_demon_shop" ADD COLUMN     "nbrUpAir" INTEGER NOT NULL,
ADD COLUMN     "nbrUpFire" INTEGER NOT NULL,
ADD COLUMN     "nbrUpLightning" INTEGER NOT NULL,
ADD COLUMN     "nbrUpWater" INTEGER NOT NULL,
ADD COLUMN     "nbrUpWood" INTEGER NOT NULL;
