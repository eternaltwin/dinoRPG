-- AlterTable
ALTER TABLE "dungeon" ADD COLUMN IF NOT EXISTS "fightBackgrounds" TEXT NOT NULL DEFAULT '[]';
