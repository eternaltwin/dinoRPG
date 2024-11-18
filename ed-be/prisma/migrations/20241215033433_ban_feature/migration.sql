/*
  Warnings:

  - The `sorted` column on the `Moderation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[banCaseId]` on the table `player` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ModerationAction" AS ENUM ('closed', 'warning', 'shortBan', 'mediumBan', 'longBan', 'infiniteBan');

-- AlterTable
ALTER TABLE "Moderation" ADD COLUMN     "banDate" TIMESTAMP(3),
ADD COLUMN     "banEndDate" TIMESTAMP(3),
DROP COLUMN "sorted",
ADD COLUMN     "sorted" "ModerationAction";

-- AlterTable
ALTER TABLE "player" ADD COLUMN     "banCaseId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "player_banCaseId_key" ON "player"("banCaseId");

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_banCaseId_fkey" FOREIGN KEY ("banCaseId") REFERENCES "Moderation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
