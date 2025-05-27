-- AlterTable
ALTER TABLE "player" ADD COLUMN     "discoveredSkills" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
