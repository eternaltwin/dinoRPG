-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CHRISTMAS', 'VALENTINE');

-- CreateTable
CREATE TABLE "Events" (
    "event" "EventType" NOT NULL,
    "playerId" UUID NOT NULL,
    "totalProgression" INTEGER NOT NULL,
    "dailyProgression" INTEGER NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("event","playerId")
);

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
