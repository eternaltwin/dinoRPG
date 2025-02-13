-- AlterTable
ALTER TABLE "player" ADD COLUMN     "connexionToken" UUID NOT NULL DEFAULT uuid_generate_v4();
