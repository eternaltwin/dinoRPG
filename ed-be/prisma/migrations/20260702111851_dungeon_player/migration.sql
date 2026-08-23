/*
  Warnings:

  - You are about to drop the column `cipher` on the `dungeon_run` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `dungeon_run` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `dungeon_run` table. All the data in the column will be lost.
  - Added the required column `dungeonId` to the `dungeon_run` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerId` to the `dungeon_run` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DungeonType" AS ENUM ('cavern', 'crypt', 'egypt', 'forest', 'hell', 'ruin', 'sewer', 'stone');

-- AlterTable
ALTER TABLE "dungeon_run" DROP COLUMN "cipher",
DROP COLUMN "iv",
DROP COLUMN "tag",
ADD COLUMN     "dungeonId" UUID NOT NULL,
ADD COLUMN     "playerId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "dungeon" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "cipher" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "tag" BYTEA NOT NULL,
    "type" "DungeonType" NOT NULL,

    CONSTRAINT "dungeon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dungeon_id_idx" ON "dungeon"("id");

-- CreateIndex
CREATE INDEX "dungeon_run_id_idx" ON "dungeon_run"("id");

-- CreateIndex
CREATE INDEX "dungeon_run_playerId_idx" ON "dungeon_run"("playerId");

-- AddForeignKey
ALTER TABLE "dungeon_run" ADD CONSTRAINT "dungeon_run_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dungeon_run" ADD CONSTRAINT "dungeon_run_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "dungeon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
