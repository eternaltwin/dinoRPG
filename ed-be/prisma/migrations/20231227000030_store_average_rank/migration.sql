-- AlterTable
ALTER TABLE "ranking" ADD COLUMN     "average" INTEGER NOT NULL DEFAULT 0;

-- Update average column (points * dinozCount) rounded to the nearest integer
UPDATE "ranking" SET "average" = ROUND("points" * "dinozCount");
