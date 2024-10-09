/*
  Warnings:

  - Made the column `playerId` on table `dinoz` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "dinoz" ALTER COLUMN "playerId" SET NOT NULL;
