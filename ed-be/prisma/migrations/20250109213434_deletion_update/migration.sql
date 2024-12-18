/*
  Warnings:

  - You are about to drop the column `deleted` on the `player` table. All the data in the column will be lost.
  - Added the required column `authorMessage` to the `ClanHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerOldId` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderName` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerName` to the `Pantheon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorName` to the `clan_messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClanHistory" DROP CONSTRAINT "ClanHistory_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ClanJoinRequest" DROP CONSTRAINT "ClanJoinRequest_playerId_fkey";

-- DropForeignKey
ALTER TABLE "ClanMember" DROP CONSTRAINT "ClanMember_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Pantheon" DROP CONSTRAINT "Pantheon_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Participants" DROP CONSTRAINT "Participants_playerId_fkey";

-- DropForeignKey
ALTER TABLE "clan_messages" DROP CONSTRAINT "clan_messages_authorId_fkey";

-- DropForeignKey
ALTER TABLE "playerTracking" DROP CONSTRAINT "playerTracking_playerId_fkey";

-- AlterTable ClanHistory


ALTER TABLE "ClanHistory" ADD COLUMN     "authorMessage" TEXT;

UPDATE "ClanHistory"
SET "authorMessage" = "player"."name"
FROM "player"
WHERE "ClanHistory"."authorId" = "player"."id";

ALTER TABLE "ClanHistory" ALTER COLUMN "authorId" DROP NOT NULL,
													ALTER COLUMN "authorMessage" SET NOT NULL;



-- AlterTable Conversation


ALTER TABLE "Conversation" ADD COLUMN     "createdByName" TEXT;

UPDATE "Conversation"
SET "createdByName" = "player"."name"
FROM "player"
WHERE "Conversation"."createdById" = "player"."id";

ALTER TABLE "Conversation" ALTER COLUMN "createdById" DROP NOT NULL,
													ALTER COLUMN "createdByName" SET NOT NULL;



-- AlterTable Log

DELETE FROM "Log" WHERE "playerId" IS NULL;

ALTER TABLE "Log" ADD COLUMN     "playerOldId" TEXT;

UPDATE "Log"
SET "playerOldId" = "playerId";

ALTER TABLE "Log" ALTER COLUMN "playerOldId" SET NOT NULL;



-- AlterTable Message


ALTER TABLE "Message" ADD COLUMN     "senderName" TEXT;

UPDATE "Message"
SET "senderName" = "player"."name"
FROM "player"
WHERE "Message"."senderId" = "player"."id";

ALTER TABLE "Message" ALTER COLUMN "senderId" DROP NOT NULL,
											 ALTER COLUMN "senderName" SET NOT NULL;



-- AlterTable Pantheon


ALTER TABLE "Pantheon" ADD COLUMN     "playerName" TEXT;

UPDATE "Pantheon"
SET "playerName" = "player"."name"
FROM "player"
WHERE "Pantheon"."playerId" = "player"."id";

ALTER TABLE "Pantheon" ALTER COLUMN "playerId" DROP NOT NULL,
													 ALTER COLUMN "playerName" SET NOT NULL;



-- AlterTable Particpants


ALTER TABLE "Participants" ADD COLUMN     "playerName" TEXT;

UPDATE "Participants"
SET "playerName" = "player"."name"
FROM "player"
WHERE "Participants"."playerId" = "player"."id";

ALTER TABLE "Participants" ALTER COLUMN "playerId" DROP NOT NULL,
														ALTER COLUMN "playerName" SET NOT NULL;




-- AlterTable Clan_message


ALTER TABLE "clan_messages" ADD COLUMN     "authorName" TEXT;

UPDATE "clan_messages"
SET "authorName" = "player"."name"
FROM "player"
WHERE "clan_messages"."authorId" = "player"."id";

ALTER TABLE "clan_messages" ALTER COLUMN "authorId" DROP NOT NULL,
													 ALTER COLUMN "authorName" SET NOT NULL;



-- AlterTable
ALTER TABLE "player" DROP COLUMN "deleted";

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playerTracking" ADD CONSTRAINT "playerTracking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pantheon" ADD CONSTRAINT "Pantheon_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanJoinRequest" ADD CONSTRAINT "ClanJoinRequest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_messages" ADD CONSTRAINT "clan_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanHistory" ADD CONSTRAINT "ClanHistory_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanMember" ADD CONSTRAINT "ClanMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participants" ADD CONSTRAINT "Participants_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
