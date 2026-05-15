-- AlterTable
ALTER TABLE "dinoz" ADD COLUMN     "castleId" INTEGER;

-- CreateTable
CREATE TABLE "ClanCastle" (
    "id" SERIAL NOT NULL,
    "clanId" INTEGER NOT NULL,
    "placeId" INTEGER NOT NULL,
    "maxLife" INTEGER NOT NULL DEFAULT 100,
    "currentLife" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "ClanCastle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClanCastle_clanId_key" ON "ClanCastle"("clanId");

-- AddForeignKey
ALTER TABLE "dinoz" ADD CONSTRAINT "dinoz_castleId_fkey" FOREIGN KEY ("castleId") REFERENCES "ClanCastle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanCastle" ADD CONSTRAINT "ClanCastle_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
