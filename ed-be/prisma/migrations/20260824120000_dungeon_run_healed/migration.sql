-- AlterTable
ALTER TABLE "dungeon_run" ADD COLUMN IF NOT EXISTS "healed" TEXT NOT NULL DEFAULT '[]';
