-- AlterTable
ALTER TABLE "dojo" ALTER COLUMN "activeChallenge" DROP NOT NULL,
ALTER COLUMN "activeChallenge" DROP DEFAULT,
ALTER COLUMN "activeChallenge" SET DATA TYPE TEXT;
