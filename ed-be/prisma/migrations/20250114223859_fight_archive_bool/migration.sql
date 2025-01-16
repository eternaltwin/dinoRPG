/*
  Warnings:

  - Added the required column `result` to the `FightArchive` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FightArchive" ADD COLUMN     "result" BOOLEAN NOT NULL;
