/*
  Warnings:

  - You are about to drop the column `averagePoints` on the `ranking` table. All the data in the column will be lost.
  - You are about to drop the column `averagePointsDisplayed` on the `ranking` table. All the data in the column will be lost.
  - You are about to drop the column `averagePosition` on the `ranking` table. All the data in the column will be lost.
  - You are about to drop the column `dinozCountDisplayed` on the `ranking` table. All the data in the column will be lost.
  - You are about to drop the column `sumPoints` on the `ranking` table. All the data in the column will be lost.
  - You are about to drop the column `sumPointsDisplayed` on the `ranking` table. All the data in the column will be lost.
  - You are about to drop the column `sumPosition` on the `ranking` table. All the data in the column will be lost.

*/

-- Add points column
ALTER TABLE "ranking" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 0;

-- Update points column
UPDATE "ranking" SET "points" = "sumPoints";

-- Drop old columns
ALTER TABLE "ranking" DROP COLUMN "averagePoints",
DROP COLUMN "averagePointsDisplayed",
DROP COLUMN "averagePosition",
DROP COLUMN "dinozCountDisplayed",
DROP COLUMN "sumPoints",
DROP COLUMN "sumPointsDisplayed",
DROP COLUMN "sumPosition";
