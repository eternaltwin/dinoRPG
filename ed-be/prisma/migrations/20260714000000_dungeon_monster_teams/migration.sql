-- AlterTable
ALTER TABLE "dungeon" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "monsters" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "dungeon_run" DROP COLUMN "monsters",
ADD COLUMN "defeated" TEXT NOT NULL DEFAULT '[]';
