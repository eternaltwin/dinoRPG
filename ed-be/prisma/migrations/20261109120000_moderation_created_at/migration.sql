-- AlterTable
-- Reports created before this column existed get the migration date: they block an account deletion
-- for the grace period at most, like a fresh report.
ALTER TABLE "Moderation" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
