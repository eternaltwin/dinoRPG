-- CreateEnum
CREATE TYPE "NewsType" AS ENUM ('update', 'information', 'war', 'war_mana', 'championship', 'tid_start', 'tid_end', 'event_christmas', 'story', 'announce');

-- AlterTable
ALTER TABLE "news" ADD COLUMN     "type" "NewsType" NOT NULL DEFAULT 'update';
