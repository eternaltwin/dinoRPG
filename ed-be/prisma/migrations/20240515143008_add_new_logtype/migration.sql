-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LogType" ADD VALUE 'IngredientSold';
ALTER TYPE "LogType" ADD VALUE 'XPEarned';
ALTER TYPE "LogType" ADD VALUE 'HPLost';
ALTER TYPE "LogType" ADD VALUE 'PlayerCreated';
ALTER TYPE "LogType" ADD VALUE 'PlayerConnected';
