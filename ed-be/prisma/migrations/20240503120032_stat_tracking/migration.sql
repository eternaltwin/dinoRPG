-- CreateTable
CREATE TABLE "PlayerTracking" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "stat" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "PlayerTracking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerTracking" ADD CONSTRAINT "PlayerTracking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
