/*
  Warnings:

  - The `type` column on the `ClanHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rights` column on the `ClanMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ClanHistory" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'CLAN_CREATED';

-- AlterTable
ALTER TABLE "ClanMember" DROP COLUMN "rights",
ADD COLUMN     "rights" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropEnum
DROP TYPE "ClanHistoryType";

-- DropEnum
DROP TYPE "ClanMemberRight";
