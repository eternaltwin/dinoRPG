/*
  Warnings:

  - You are about to drop the column `isFrozen` on the `dinoz` table. All the data in the column will be lost.
  - You are about to drop the column `isSacrificed` on the `dinoz` table. All the data in the column will be lost.
  - You are about to drop the column `isSelling` on the `dinoz` table. All the data in the column will be lost.
  - You are about to drop the column `resting` on the `dinoz` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UnavailableReason" AS ENUM ('frozen', 'sacrificed', 'selling', 'superdom', 'resting');

-- AlterTable
ALTER TABLE "dinoz" DROP COLUMN "isFrozen",
DROP COLUMN "isSacrificed",
DROP COLUMN "isSelling",
DROP COLUMN "resting",
ADD COLUMN     "unavailableReason" "UnavailableReason";
