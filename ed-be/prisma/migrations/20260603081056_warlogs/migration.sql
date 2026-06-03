-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LogType" ADD VALUE 'ClanWarCastleBuilt';
ALTER TYPE "LogType" ADD VALUE 'ClanWarDeclared';
ALTER TYPE "LogType" ADD VALUE 'ClanWarForfeited';
ALTER TYPE "LogType" ADD VALUE 'ClanWarDefenderAdded';
ALTER TYPE "LogType" ADD VALUE 'ClanWarDefenderRemoved';
ALTER TYPE "LogType" ADD VALUE 'ClanWarDefenseOrderUpdated';
ALTER TYPE "LogType" ADD VALUE 'ClanWarCastleAttacked';
ALTER TYPE "LogType" ADD VALUE 'ClanWarCastleRepaired';
ALTER TYPE "LogType" ADD VALUE 'ClanWarResolved';
