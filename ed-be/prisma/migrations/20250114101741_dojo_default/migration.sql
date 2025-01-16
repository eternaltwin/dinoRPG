-- AlterTable
ALTER TABLE "DojoOpponents" ALTER COLUMN "fighted" SET DEFAULT false,
ALTER COLUMN "achieved" SET DEFAULT false;

-- AlterTable
ALTER TABLE "DojoTeam" ALTER COLUMN "fighted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "dojo" ALTER COLUMN "activeChallenge" SET DEFAULT 0,
ALTER COLUMN "reputation" SET DEFAULT 0;
