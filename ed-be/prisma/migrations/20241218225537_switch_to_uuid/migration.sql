/*
  Warnings:

  - The `playerId` column on the `Conversation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `playerId` column on the `UsernameHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `player` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `eternalTwinId` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `hasImported` on the `player` table. All the data in the column will be lost.
  - The `playerId` column on the `player_dinoz_shop` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `playerId` column on the `player_gather` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `playerId` column on the `player_ingredient` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `playerId` column on the `player_item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `playerId` column on the `player_quest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `playerId` column on the `player_reward` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `playerId` column on the `ranking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `leaderId` on the `Clan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `authorId` on the `ClanHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `playerId` on the `ClanJoinRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `playerId` on the `ClanMember` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createdById` on the `Conversation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `playerId` on the `Log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `senderId` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `reporterId` on the `Moderation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `targetId` on the `Moderation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `playerId` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sellerId` on the `Offer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `OfferBid` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `playerId` on the `Pantheon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `playerId` on the `Participants` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `authorId` on the `clan_messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `playerId` on the `dinoz` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `player` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `playerId` on the `playerTracking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/


-- DropForeignKey
ALTER TABLE "Clan" DROP CONSTRAINT "Clan_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "ClanHistory" DROP CONSTRAINT "ClanHistory_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ClanJoinRequest" DROP CONSTRAINT "ClanJoinRequest_playerId_fkey";

-- DropForeignKey
ALTER TABLE "ClanMember" DROP CONSTRAINT "ClanMember_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Moderation" DROP CONSTRAINT "Moderation_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "Moderation" DROP CONSTRAINT "Moderation_targetId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "OfferBid" DROP CONSTRAINT "OfferBid_userId_fkey";

-- DropForeignKey
ALTER TABLE "Pantheon" DROP CONSTRAINT "Pantheon_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Participants" DROP CONSTRAINT "Participants_playerId_fkey";

-- DropForeignKey
ALTER TABLE "UsernameHistory" DROP CONSTRAINT "UsernameHistory_playerId_fkey";

-- DropForeignKey
ALTER TABLE "clan_messages" DROP CONSTRAINT "clan_messages_authorId_fkey";

-- DropForeignKey
ALTER TABLE "dinoz" DROP CONSTRAINT "FK_064135f23ecaf0207af9926d7c9";

-- DropForeignKey
ALTER TABLE "playerTracking" DROP CONSTRAINT "playerTracking_playerId_fkey";

-- DropForeignKey
ALTER TABLE "player_dinoz_shop" DROP CONSTRAINT "FK_c79ab61aa32fe6e81c03a7d87d1";

-- DropForeignKey
ALTER TABLE "player_gather" DROP CONSTRAINT "FK_86eed52f66f7126e4dc7a998cdf";

-- DropForeignKey
ALTER TABLE "player_ingredient" DROP CONSTRAINT "FK_ad198392886a52e7f184474a0d6";

-- DropForeignKey
ALTER TABLE "player_item" DROP CONSTRAINT "FK_21535fcb93f8613fd893b74b08b";

-- DropForeignKey
ALTER TABLE "player_quest" DROP CONSTRAINT "FK_1b5b041fab3362c845c142ca3b0";

-- DropForeignKey
ALTER TABLE "player_reward" DROP CONSTRAINT "FK_9cf142b3a6fa3e0faec7f8debfb";

-- DropForeignKey
ALTER TABLE "ranking" DROP CONSTRAINT "FK_3ac96196d0a3851989be8c52a9a";

-- AlterTable
ALTER TABLE "player" DROP CONSTRAINT "PK_65edadc946a7faf4b638d5e8885",
										 ADD COLUMN "temp_id" INT;

UPDATE "player"
SET "temp_id" = "id";


ALTER TABLE "player"
	ADD CONSTRAINT "player_pkey" PRIMARY KEY ("temp_id"),
	DROP COLUMN "id",
	ADD COLUMN     "id" UUID;

DELETE FROM "player" WHERE "eternalTwinId" = 'DELETED';

UPDATE "player"
SET "id" = "eternalTwinId"::UUID;

ALTER TABLE "player"
	DROP COLUMN "eternalTwinId",
	DROP COLUMN "hasImported",
	ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
	ALTER COLUMN "id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Clan"
	ADD COLUMN "temp_leader" INT;

UPDATE "Clan"
SET
	"temp_leader" = "leaderId";

ALTER TABLE "Clan"
	DROP COLUMN "leaderId",
	ADD COLUMN     "leaderId" UUID;



-- AlterTable
ALTER TABLE "ClanHistory"
	ADD COLUMN "temp_author" INT;

UPDATE "ClanHistory"
SET
	"temp_author" = "authorId";

ALTER TABLE "ClanHistory"
	DROP COLUMN "authorId",
	ADD COLUMN     "authorId" UUID;



-- AlterTable
ALTER TABLE "ClanJoinRequest"
	ADD COLUMN "temp_player" INT;

UPDATE "ClanJoinRequest"
SET
	"temp_player" = "playerId";

ALTER TABLE "ClanJoinRequest"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "ClanMember"
	ADD COLUMN "temp_player" INT;

UPDATE "ClanMember"
SET
	"temp_player" = "playerId";

ALTER TABLE "ClanMember"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "Conversation"
	ADD COLUMN "temp_createdBy" INT,
	ADD COLUMN "temp_player" INT;

UPDATE "Conversation"
SET
	"temp_createdBy" = "createdById",
	"temp_player" = "playerId";

ALTER TABLE "Conversation"
	DROP COLUMN "playerId",
	DROP COLUMN "createdById",
	ADD COLUMN 	"createdById" UUID,
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "Log"
	ADD COLUMN "temp_player" INT;

UPDATE "Log"
SET
	"temp_player" = "playerId";

ALTER TABLE "Log"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "Message"
	ADD COLUMN "temp_player" INT;

UPDATE "Message"
SET
	"temp_player" = "senderId";

ALTER TABLE "Message"
	DROP COLUMN "senderId",
	ADD COLUMN     "senderId" UUID;



-- AlterTable
ALTER TABLE "Moderation"
	ADD COLUMN "temp_reporter" INT,
	ADD COLUMN "temp_target" INT;

UPDATE "Moderation"
SET
	"temp_reporter" = "reporterId",
	"temp_target" = "targetId";

ALTER TABLE "Moderation"
	DROP COLUMN "reporterId",
	DROP COLUMN "targetId",
	ADD COLUMN "reporterId" UUID,
	ADD COLUMN     "targetId" UUID;



-- AlterTable
ALTER TABLE "Notification"
	ADD COLUMN "temp_player" INT;

UPDATE "Notification"
SET
	"temp_player" = "playerId";

ALTER TABLE "Notification"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "Offer"
	ADD COLUMN "temp_seller" INT;

UPDATE "Offer"
SET
	"temp_seller" = "sellerId";

ALTER TABLE "Offer"
	DROP COLUMN "sellerId",
	ADD COLUMN     "sellerId" UUID;



-- AlterTable
ALTER TABLE "OfferBid"
	ADD COLUMN "temp_user" INT;

UPDATE "OfferBid"
SET
	"temp_user" = "userId";

ALTER TABLE "OfferBid"
	DROP COLUMN "userId",
	ADD COLUMN     "userId" UUID;



-- AlterTable
ALTER TABLE "Pantheon"
	ADD COLUMN "temp_player" INT;

UPDATE "Pantheon"
SET
	"temp_player" = "playerId";

ALTER TABLE "Pantheon"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "Participants"
	ADD COLUMN "temp_player" INT;

UPDATE "Participants"
SET
	"temp_player" = "playerId";

ALTER TABLE "Participants"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "UsernameHistory"
	ADD COLUMN "temp_player" INT;

UPDATE "UsernameHistory"
SET
	"temp_player" = "playerId";

ALTER TABLE "UsernameHistory"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "clan_messages"
	ADD COLUMN "temp_author" INT;

UPDATE "clan_messages"
SET
	"temp_author" = "authorId";

ALTER TABLE "clan_messages"
	DROP COLUMN "authorId",
	ADD COLUMN     "authorId" UUID;



-- AlterTable
ALTER TABLE "dinoz"
	ADD COLUMN "temp_player" INT;

UPDATE "dinoz"
SET
	"temp_player" = "playerId";

ALTER TABLE "dinoz"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;







-- AlterTable
ALTER TABLE "playerTracking"
	ADD COLUMN "temp_player" INT;

UPDATE "playerTracking"
SET
	"temp_player" = "playerId";

ALTER TABLE "playerTracking"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "player_dinoz_shop"
	ADD COLUMN "temp_player" INT;

UPDATE "player_dinoz_shop"
SET
	"temp_player" = "playerId";

ALTER TABLE "player_dinoz_shop"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "player_gather"
	ADD COLUMN "temp_player" INT;

UPDATE "player_gather"
SET
	"temp_player" = "playerId";

ALTER TABLE "player_gather"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "player_ingredient"
	ADD COLUMN "temp_player" INT;

UPDATE "player_ingredient"
SET
	"temp_player" = "playerId";

ALTER TABLE "player_ingredient"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "player_item"
	ADD COLUMN "temp_player" INT;

UPDATE "player_item"
SET
	"temp_player" = "playerId";

ALTER TABLE "player_item"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "player_quest"
	ADD COLUMN "temp_player" INT;

UPDATE "player_quest"
SET
	"temp_player" = "playerId";

ALTER TABLE "player_quest"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "player_reward"
	ADD COLUMN "temp_player" INT;

UPDATE "player_reward"
SET
	"temp_player" = "playerId";

ALTER TABLE "player_reward"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;



-- AlterTable
ALTER TABLE "ranking"
	ADD COLUMN "temp_player" INT;

UPDATE "ranking"
SET
	"temp_player" = "playerId";

ALTER TABLE "ranking"
	DROP COLUMN "playerId",
	ADD COLUMN     "playerId" UUID;




-- UPDATE DATAS

UPDATE "Clan"
SET "leaderId" = "player"."id"
FROM "player"
WHERE "Clan"."temp_leader" = "player"."temp_id";



UPDATE "ClanHistory"
SET "authorId" = "player"."id"
FROM "player"
WHERE "ClanHistory"."temp_author" = "player"."temp_id";



UPDATE "ClanJoinRequest"
SET "playerId" = "player"."id"
FROM "player"
WHERE "ClanJoinRequest"."temp_player" = "player"."temp_id";



UPDATE "ClanMember"
SET "playerId" = "player"."id"
FROM "player"
WHERE "ClanMember"."temp_player" = "player"."temp_id";



UPDATE "Conversation"
SET "playerId" = "player"."id"
FROM "player"
WHERE "Conversation"."temp_player" = "player"."temp_id";

UPDATE "Conversation"
SET "createdById" = "player"."id"
FROM "player"
WHERE "Conversation"."temp_createdBy" = "player"."temp_id";



UPDATE "Log"
SET "playerId" = "player"."id"
FROM "player"
WHERE "Log"."temp_player" = "player"."temp_id";



UPDATE "Message"
SET "senderId" = "player"."id"
FROM "player"
WHERE "Message"."temp_player" = "player"."temp_id";



UPDATE "Moderation"
SET "reporterId" = "player"."id"
FROM "player"
WHERE "Moderation"."temp_reporter" = "player"."temp_id";

UPDATE "Moderation"
SET "targetId" = "player"."id"
FROM "player"
WHERE "Moderation"."temp_target" = "player"."temp_id";



UPDATE "Notification"
SET "playerId" = "player"."id"
FROM "player"
WHERE "Notification"."temp_player" = "player"."temp_id";



UPDATE "Offer"
SET "sellerId" = "player"."id"
FROM "player"
WHERE "Offer"."temp_seller" = "player"."temp_id";



UPDATE "OfferBid"
SET "userId" = "player"."id"
FROM "player"
WHERE "OfferBid"."temp_user" = "player"."temp_id";



UPDATE "Pantheon"
SET "playerId" = "player"."id"
FROM "player"
WHERE "Pantheon"."temp_player" = "player"."temp_id";



UPDATE "Participants"
SET "playerId" = "player"."id"
FROM "player"
WHERE "Participants"."temp_player" = "player"."temp_id";



UPDATE "UsernameHistory"
SET "playerId" = "player"."id"
FROM "player"
WHERE "UsernameHistory"."temp_player" = "player"."temp_id";



UPDATE "clan_messages"
SET "authorId" = "player"."id"
FROM "player"
WHERE "clan_messages"."temp_author" = "player"."temp_id";



UPDATE "dinoz"
SET "playerId" = "player"."id"
FROM "player"
WHERE "dinoz"."temp_player" = "player"."temp_id";



UPDATE "playerTracking"
SET "playerId" = "player"."id"
FROM "player"
WHERE "playerTracking"."temp_player" = "player"."temp_id";



UPDATE "player_dinoz_shop"
SET "playerId" = "player"."id"
FROM "player"
WHERE "player_dinoz_shop"."temp_player" = "player"."temp_id";



UPDATE "player_gather"
SET "playerId" = "player"."id"
FROM "player"
WHERE "player_gather"."temp_player" = "player"."temp_id";



UPDATE "player_ingredient"
SET "playerId" = "player"."id"
FROM "player"
WHERE "player_ingredient"."temp_player" = "player"."temp_id";



UPDATE "player_item"
SET "playerId" = "player"."id"
FROM "player"
WHERE "player_item"."temp_player" = "player"."temp_id";



UPDATE "player_quest"
SET "playerId" = "player"."id"
FROM "player"
WHERE "player_quest"."temp_player" = "player"."temp_id";



UPDATE "player_reward"
SET "playerId" = "player"."id"
FROM "player"
WHERE "player_reward"."temp_player" = "player"."temp_id";



UPDATE "ranking"
SET "playerId" = "player"."id"
FROM "player"
WHERE "ranking"."temp_player" = "player"."temp_id";



-- CreateIndex
CREATE UNIQUE INDEX "Clan_leaderId_key" ON "Clan"("leaderId");

-- CreateIndex
CREATE UNIQUE INDEX "ClanJoinRequest_playerId_key" ON "ClanJoinRequest"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "ClanMember_playerId_key" ON "ClanMember"("playerId");

-- CreateIndex
CREATE INDEX "Log_playerId_dinozId_type_idx" ON "Log"("playerId", "dinozId", "type");

-- CreateIndex
CREATE INDEX "Notification_playerId_read_idx" ON "Notification"("playerId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "Participants_playerId_conversationId_key" ON "Participants"("playerId", "conversationId");

-- CreateIndex
CREATE INDEX "UsernameHistory_playerId_idx" ON "UsernameHistory"("playerId");

-- CreateIndex
CREATE INDEX "idx_playerId" ON "dinoz"("playerId");

-- CreateIndex
CREATE INDEX "playerTracking_playerId_idx" ON "playerTracking"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "playerTracking_stat_playerId_key" ON "playerTracking"("stat", "playerId");

-- CreateIndex
CREATE INDEX "player_gather_playerId_idx" ON "player_gather"("playerId");

-- CreateIndex
CREATE INDEX "player_ingredient_playerId_idx" ON "player_ingredient"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "player_ingredient_ingredientId_playerId_key" ON "player_ingredient"("ingredientId", "playerId");

-- CreateIndex
CREATE INDEX "player_item_playerId_idx" ON "player_item"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "player_item_itemId_playerId_key" ON "player_item"("itemId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "player_quest_questId_playerId_key" ON "player_quest"("questId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "player_reward_rewardId_playerId_key" ON "player_reward"("rewardId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "REL_3ac96196d0a3851989be8c52a9" ON "ranking"("playerId");

-- CreateIndex
CREATE INDEX "ranking_playerId_idx" ON "ranking"("playerId");

CREATE UNIQUE INDEX ON player("id");

-- AddForeignKey
ALTER TABLE "dinoz" ADD CONSTRAINT "FK_064135f23ecaf0207af9926d7c9" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UsernameHistory" ADD CONSTRAINT "UsernameHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_dinoz_shop" ADD CONSTRAINT "FK_c79ab61aa32fe6e81c03a7d87d1" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_gather" ADD CONSTRAINT "FK_86eed52f66f7126e4dc7a998cdf" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_ingredient" ADD CONSTRAINT "FK_ad198392886a52e7f184474a0d6" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_item" ADD CONSTRAINT "FK_21535fcb93f8613fd893b74b08b" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_quest" ADD CONSTRAINT "FK_1b5b041fab3362c845c142ca3b0" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_reward" ADD CONSTRAINT "FK_9cf142b3a6fa3e0faec7f8debfb" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ranking" ADD CONSTRAINT "FK_3ac96196d0a3851989be8c52a9a" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OfferBid" ADD CONSTRAINT "OfferBid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playerTracking" ADD CONSTRAINT "playerTracking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pantheon" ADD CONSTRAINT "Pantheon_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clan" ADD CONSTRAINT "Clan_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanJoinRequest" ADD CONSTRAINT "ClanJoinRequest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_messages" ADD CONSTRAINT "clan_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanHistory" ADD CONSTRAINT "ClanHistory_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanMember" ADD CONSTRAINT "ClanMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participants" ADD CONSTRAINT "Participants_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove temp
ALTER TABLE "player"
	DROP CONSTRAINT "player_pkey",
	ADD CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"),
	DROP COLUMN "temp_id";

ALTER TABLE "Clan"
	DROP COLUMN "temp_leader";

ALTER TABLE "ClanHistory"
	DROP COLUMN "temp_author";

ALTER TABLE "ClanJoinRequest"
	DROP COLUMN "temp_player";

ALTER TABLE "ClanMember"
	DROP COLUMN "temp_player";
ALTER TABLE "Conversation"
	DROP COLUMN "temp_createdBy",
	DROP COLUMN "temp_player";
ALTER TABLE "Log"
	DROP COLUMN "temp_player";
ALTER TABLE "Message"
	DROP COLUMN "temp_player";

ALTER TABLE "Moderation"
	DROP COLUMN "temp_reporter",
	DROP COLUMN "temp_target";
ALTER TABLE "Notification"
	DROP COLUMN "temp_player";
ALTER TABLE "Offer"
	DROP COLUMN "temp_seller";
ALTER TABLE "OfferBid"
	DROP COLUMN "temp_user";
ALTER TABLE "Pantheon"
	DROP COLUMN "temp_player";
ALTER TABLE "Participants"
	DROP COLUMN "temp_player";
ALTER TABLE "UsernameHistory"
	DROP COLUMN "temp_player";
ALTER TABLE "clan_messages"
	DROP COLUMN "temp_author";
ALTER TABLE "dinoz"
	DROP COLUMN "temp_player";
ALTER TABLE "playerTracking"
	DROP COLUMN "temp_player";
ALTER TABLE "player_dinoz_shop"
	DROP COLUMN "temp_player";
ALTER TABLE "player_gather"
	DROP COLUMN "temp_player";
ALTER TABLE "player_ingredient"
	DROP COLUMN "temp_player";
ALTER TABLE "player_item"
	DROP COLUMN "temp_player";
ALTER TABLE "player_quest"
	DROP COLUMN "temp_player";
ALTER TABLE "player_reward"
	DROP COLUMN "temp_player";
ALTER TABLE "ranking"
	DROP COLUMN "temp_player";
