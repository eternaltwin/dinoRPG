/*
  Warnings:

  - Made the column `leaderId` on table `Clan` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authorId` on table `ClanHistory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `ClanJoinRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `ClanMember` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `Conversation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `Conversation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dinozId` on table `DinozCatch` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `Log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `senderId` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reporterId` on table `Moderation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `targetId` on table `Moderation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sellerId` on table `Offer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `OfferBid` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `Pantheon` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `Participants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `UsernameHistory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clanId` on table `clan_ingredient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authorId` on table `clan_messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `dinoz` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `playerTracking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `player_dinoz_shop` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `player_gather` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `player_ingredient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `player_item` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `player_quest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `player_reward` required. This step will fail if there are existing NULL values in that column.
  - Made the column `playerId` on table `ranking` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_playerId_fkey";

-- AlterTable
DELETE FROM "ClanHistory" WHERE "authorId" IS NULL;
ALTER TABLE "Clan" ALTER COLUMN "leaderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ClanHistory" ALTER COLUMN "authorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ClanJoinRequest" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ClanMember" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "DinozCatch" ALTER COLUMN "dinozId" SET NOT NULL;


-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "senderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Moderation" ALTER COLUMN "reporterId" SET NOT NULL,
ALTER COLUMN "targetId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
DELETE FROM "OfferBid"
WHERE "offerId" IN (
	SELECT "id" FROM "Offer" WHERE "sellerId" IS NULL
);
DELETE FROM "OfferItem"
WHERE "offerId" IN (
	SELECT "id" FROM "Offer" WHERE "sellerId" IS NULL
);
DELETE FROM "Offer" WHERE "sellerId" IS NULL;
ALTER TABLE "Offer" ALTER COLUMN "sellerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "OfferBid" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
DELETE FROM "Pantheon" WHERE "playerId" IS NULL;
ALTER TABLE "Pantheon" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Participants" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UsernameHistory" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "clan_ingredient" ALTER COLUMN "clanId" SET NOT NULL;

-- AlterTable
DELETE FROM "clan_messages" WHERE "authorId" IS NULL;
ALTER TABLE "clan_messages" ALTER COLUMN "authorId" SET NOT NULL;

-- AlterTable
DELETE FROM "dinoz" WHERE "playerId" IS NULL;
ALTER TABLE "dinoz" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
DELETE FROM "playerTracking" WHERE "playerId" IS NULL;
ALTER TABLE "playerTracking" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
DELETE FROM "player_dinoz_shop" WHERE "playerId" IS NULL;
ALTER TABLE "player_dinoz_shop" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "player_gather" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "player_ingredient" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
DELETE FROM "player_item" WHERE "playerId" IS NULL;
ALTER TABLE "player_item" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "player_quest" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "player_reward" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ranking" ALTER COLUMN "playerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
