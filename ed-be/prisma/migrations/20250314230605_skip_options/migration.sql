-- AlterTable
ALTER TABLE "player" ADD COLUMN     "skipFight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "skipLevel" BOOLEAN NOT NULL DEFAULT false;
