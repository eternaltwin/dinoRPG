-- AlterTable
ALTER TABLE "dungeon" ADD COLUMN IF NOT EXISTS "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "monsters" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
-- IF EXISTS: dungeon_run.monsters only ever existed via db push / an uncommitted
-- migration, so some databases never had it.
ALTER TABLE "dungeon_run" DROP COLUMN IF EXISTS "monsters",
ADD COLUMN IF NOT EXISTS "defeated" TEXT NOT NULL DEFAULT '[]';
