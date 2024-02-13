-- CreateTable
CREATE TABLE "UsernameHistory" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER,
    "username" VARCHAR NOT NULL,

    CONSTRAINT "UsernameHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UsernameHistory" ADD CONSTRAINT "UsernameHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
