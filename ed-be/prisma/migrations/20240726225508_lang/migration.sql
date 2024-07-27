-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('fr', 'en', 'de', 'es');

-- AlterTable
ALTER TABLE "player" ADD COLUMN     "lang" "Lang" NOT NULL DEFAULT 'fr';
