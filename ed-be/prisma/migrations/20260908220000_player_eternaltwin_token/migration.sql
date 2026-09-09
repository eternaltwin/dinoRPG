-- CreateTable
CREATE TABLE "player_eternaltwin_token" (
    "playerId" UUID NOT NULL,
    "accessToken" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "obtainedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(6),

    CONSTRAINT "player_eternaltwin_token_pkey" PRIMARY KEY ("playerId")
);

-- AddForeignKey
ALTER TABLE "player_eternaltwin_token" ADD CONSTRAINT "player_eternaltwin_token_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
