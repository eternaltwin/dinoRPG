/*
  Warnings:

  - You are about to drop the column `clanMemberId` on the `player` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "player_clanMemberId_key";

-- AlterTable
ALTER TABLE "player" DROP COLUMN "clanMemberId",
ADD COLUMN     "clanId" INTEGER;

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "player" p
SET "clanId" = cm."clanId"
	FROM "ClanMember" cm
WHERE cm."playerId" = p.id;
