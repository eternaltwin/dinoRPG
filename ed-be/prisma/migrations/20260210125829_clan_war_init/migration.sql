-- CreateEnum
CREATE TYPE "ClanEventType" AS ENUM ('war', 'mana_war');

-- CreateTable
CREATE TABLE "ClanEvent" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "eventType" "ClanEventType" NOT NULL,
    "startDate" TIMESTAMP(6) NOT NULL,
    "endDate" TIMESTAMP(6) NOT NULL,
    "config" TEXT NOT NULL,

    CONSTRAINT "ClanEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClanEvent_id_key" ON "ClanEvent"("id");
