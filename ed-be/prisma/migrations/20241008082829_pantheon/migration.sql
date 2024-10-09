-- CreateEnum
CREATE TYPE "PantheonMotif" AS ENUM ('race', 'epic');

-- CreateTable
CREATE TABLE "Pantheon" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "motif" "PantheonMotif" NOT NULL,
    "dinozId" INTEGER,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indicator" INTEGER,

    CONSTRAINT "Pantheon_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pantheon" ADD CONSTRAINT "Pantheon_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pantheon" ADD CONSTRAINT "Pantheon_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
