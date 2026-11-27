-- AlterEnum
ALTER TYPE "NewsType" ADD VALUE 'tid_vote';

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "featuredRaces" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "metaArchetype" TEXT NOT NULL DEFAULT 'ffa',
ADD COLUMN     "nextCandidates" JSONB,
ADD COLUMN     "nextPollId" INTEGER,
ADD COLUMN     "rules" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "poll_options" ADD COLUMN     "labels" JSONB;

-- CreateTable
CREATE TABLE "DojoQualifPool" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tournamentId" UUID NOT NULL,
    "dinozId" INTEGER NOT NULL,
    "raceId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "DojoQualifPool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DojoQualifPool_tournamentId_raceId_idx" ON "DojoQualifPool"("tournamentId", "raceId");

-- CreateIndex
CREATE UNIQUE INDEX "DojoQualifPool_tournamentId_dinozId_key" ON "DojoQualifPool"("tournamentId", "dinozId");

-- AddForeignKey
ALTER TABLE "DojoQualifPool" ADD CONSTRAINT "DojoQualifPool_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DojoQualifPool" ADD CONSTRAINT "DojoQualifPool_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
