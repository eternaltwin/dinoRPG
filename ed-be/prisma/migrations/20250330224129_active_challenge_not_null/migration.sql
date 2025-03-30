/*
  Warnings:

  - Added the required column `activeChallenge` to the `dojo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dojo" ADD COLUMN "activeChallenge_new" JSONB;
UPDATE "dojo" SET "activeChallenge_new" = '{"goal": 1, "type": "kill"}';
ALTER TABLE "dojo" DROP COLUMN "activeChallenge";
ALTER TABLE "dojo" RENAME COLUMN "activeChallenge_new" TO "activeChallenge";
ALTER TABLE "dojo" ALTER COLUMN "activeChallenge" SET NOT NULL;