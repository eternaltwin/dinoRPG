-- AlterTable
ALTER TABLE "dungeon_run" ADD COLUMN IF NOT EXISTS "scenarios" TEXT NOT NULL DEFAULT '[]';
