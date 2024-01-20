/*
  Warnings:

  - Added the required column `monsterId` to the `DinozCatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DinozCatch" ADD COLUMN     "monsterId" TEXT NOT NULL;
