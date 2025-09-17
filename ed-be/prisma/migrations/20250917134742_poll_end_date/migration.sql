/*
  Warnings:

  - You are about to drop the column `updatedDate` on the `polls` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `polls` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "polls" DROP COLUMN "updatedDate",
ADD COLUMN     "endDate" TIMESTAMP(6) NOT NULL;
