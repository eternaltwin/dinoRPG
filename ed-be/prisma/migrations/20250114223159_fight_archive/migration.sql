-- CreateTable
CREATE TABLE "FightArchive" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "fighters" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "seed" VARCHAR(255) NOT NULL,
    "playerId" UUID NOT NULL,

    CONSTRAINT "FightArchive_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FightArchive" ADD CONSTRAINT "FightArchive_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
