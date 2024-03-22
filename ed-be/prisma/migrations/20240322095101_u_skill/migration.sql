-- AlterTable
ALTER TABLE "player" ADD COLUMN     "matelasseur" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "messie" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "leader" SET DEFAULT false,
ALTER COLUMN "engineer" SET DEFAULT false,
ALTER COLUMN "cooker" SET DEFAULT false,
ALTER COLUMN "shopKeeper" SET DEFAULT false,
ALTER COLUMN "merchant" SET DEFAULT false,
ALTER COLUMN "priest" SET DEFAULT false,
ALTER COLUMN "teacher" SET DEFAULT false;
