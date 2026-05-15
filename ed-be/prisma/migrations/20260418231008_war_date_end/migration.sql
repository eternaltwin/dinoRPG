/*
  Warnings:

  - Made the column `dateEnd` on table `ClanWar` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ClanWar" ALTER COLUMN "dateEnd" SET NOT NULL;
