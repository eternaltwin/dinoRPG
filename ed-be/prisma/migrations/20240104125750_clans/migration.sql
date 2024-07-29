/*
  Warnings:

  - A unique constraint covering the columns `[clanMemberId]` on the table `player` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ClanHistoryType" AS ENUM ('CLAN_CREATED', 'PLAYER_JOIN', 'PLAYER_LEAVE', 'PLAYER_EXCLUSION', 'NEW_LEADER', 'WAR_START', 'WAR_LOSE', 'WAR_WON');

-- CreateEnum
CREATE TYPE "ClanMemberRight" AS ENUM ('PAGE_MANAGE_PUBLIC', 'PAGE_MANAGE_PRIVATE', 'PAGE_MANAGE_HOME', 'MEMBER_ACCEPT_AND_DENY_REQUESTS', 'MEMBER_EXCLUDE', 'MEMBER_SET_NICKNAME', 'MEMBER_SET_RIGHTS', 'DISCUSSION_DELETE_MESSAGE', 'CLAN_EDIT_BANNER');

-- AlterTable
ALTER TABLE "player" ADD COLUMN     "clanMemberId" INTEGER,
ADD COLUMN     "leaderOfId" INTEGER;

-- CreateTable
CREATE TABLE "Clan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "treasureValue" INTEGER NOT NULL DEFAULT 0,
    "creationDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clanWarId" INTEGER,
    "leaderId" INTEGER NOT NULL,
    "banner" BYTEA,

    CONSTRAINT "Clan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClanJoinRequest" (
    "id" SERIAL NOT NULL,
    "clanId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClanJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClanWar" (
    "id" SERIAL NOT NULL,
    "dateStart" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEnd" TIMESTAMP(3),

    CONSTRAINT "ClanWar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clan_ingredient" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "clanId" INTEGER,

    CONSTRAINT "clan_ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clan_messages" (
    "id" SERIAL NOT NULL,
    "clanId" INTEGER NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "clan_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClanHistory" (
    "id" SERIAL NOT NULL,
    "clanId" INTEGER NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    "type" "ClanHistoryType" NOT NULL DEFAULT 'CLAN_CREATED',

    CONSTRAINT "ClanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClanMember" (
    "id" SERIAL NOT NULL,
    "clanId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "rights" "ClanMemberRight"[] DEFAULT ARRAY[]::"ClanMemberRight"[],
    "dateJoin" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nickname" TEXT,

    CONSTRAINT "ClanMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClanPage" (
    "id" SERIAL NOT NULL,
    "home" BOOLEAN NOT NULL,
    "public" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "clanId" INTEGER NOT NULL,

    CONSTRAINT "ClanPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clan_leaderId_key" ON "Clan"("leaderId");

-- CreateIndex
CREATE UNIQUE INDEX "ClanJoinRequest_playerId_key" ON "ClanJoinRequest"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "clan_ingredient_ingredientId_clanId_key" ON "clan_ingredient"("ingredientId", "clanId");

-- CreateIndex
CREATE UNIQUE INDEX "clan_messages_id_clanId_key" ON "clan_messages"("id", "clanId");

-- CreateIndex
CREATE UNIQUE INDEX "ClanMember_playerId_key" ON "ClanMember"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "player_clanMemberId_key" ON "player"("clanMemberId");

-- AddForeignKey
ALTER TABLE "Clan" ADD CONSTRAINT "Clan_clanWarId_fkey" FOREIGN KEY ("clanWarId") REFERENCES "ClanWar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clan" ADD CONSTRAINT "Clan_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanJoinRequest" ADD CONSTRAINT "ClanJoinRequest_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanJoinRequest" ADD CONSTRAINT "ClanJoinRequest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_ingredient" ADD CONSTRAINT "clan_ingredient_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clan_messages" ADD CONSTRAINT "clan_messages_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clan_messages" ADD CONSTRAINT "clan_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanHistory" ADD CONSTRAINT "ClanHistory_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ClanHistory" ADD CONSTRAINT "ClanHistory_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanMember" ADD CONSTRAINT "ClanMember_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanMember" ADD CONSTRAINT "ClanMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanPage" ADD CONSTRAINT "ClanPage_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
