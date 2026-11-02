-- AlterEnum
ALTER TYPE "ClanEventType" ADD VALUE 'championship';

-- CreateTable
CREATE TABLE "clan_championship_registration" (
    "id" SERIAL NOT NULL,
    "eventId" UUID NOT NULL,
    "clanId" INTEGER NOT NULL,
    "registeredById" UUID NOT NULL,
    "registeredAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clan_championship_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clan_championship_match" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "eventId" UUID NOT NULL,
    "round" INTEGER NOT NULL,
    "homeClanId" INTEGER NOT NULL,
    "awayClanId" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(6) NOT NULL,
    "endsAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "clan_championship_match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clan_championship_registration_eventId_clanId_key" ON "clan_championship_registration"("eventId", "clanId");

-- CreateIndex
CREATE INDEX "clan_championship_match_eventId_round_idx" ON "clan_championship_match"("eventId", "round");

-- AddForeignKey
ALTER TABLE "clan_championship_registration" ADD CONSTRAINT "clan_championship_registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ClanEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_championship_registration" ADD CONSTRAINT "clan_championship_registration_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_championship_match" ADD CONSTRAINT "clan_championship_match_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ClanEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_championship_match" ADD CONSTRAINT "clan_championship_match_homeClanId_fkey" FOREIGN KEY ("homeClanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_championship_match" ADD CONSTRAINT "clan_championship_match_awayClanId_fkey" FOREIGN KEY ("awayClanId") REFERENCES "Clan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
