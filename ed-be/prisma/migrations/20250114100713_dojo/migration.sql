-- CreateTable
CREATE TABLE "dojo" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "playerId" UUID NOT NULL,
    "activeChallenge" INTEGER NOT NULL,
    "reputation" INTEGER NOT NULL,

    CONSTRAINT "dojo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DojoTeam" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "dojoId" UUID NOT NULL,
    "dinozId" INTEGER NOT NULL,
    "fighted" BOOLEAN NOT NULL,

    CONSTRAINT "DojoTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DojoOpponents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "dojoId" UUID NOT NULL,
    "dinozId" INTEGER NOT NULL,
    "fighted" BOOLEAN NOT NULL,
    "achieved" BOOLEAN NOT NULL,

    CONSTRAINT "DojoOpponents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DojoChallengeHistory" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "dojoId" UUID NOT NULL,
    "myDinozId" INTEGER NOT NULL,
    "opponentId" INTEGER NOT NULL,
    "challenge" INTEGER NOT NULL,
    "victory" BOOLEAN NOT NULL,
    "achieved" BOOLEAN NOT NULL,

    CONSTRAINT "DojoChallengeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dojo_playerId_key" ON "dojo"("playerId");

-- CreateIndex
CREATE INDEX "dojo_playerId_idx" ON "dojo"("playerId");

-- CreateIndex
CREATE INDEX "DojoTeam_dojoId_idx" ON "DojoTeam"("dojoId");

-- CreateIndex
CREATE INDEX "DojoOpponents_dojoId_idx" ON "DojoOpponents"("dojoId");

-- CreateIndex
CREATE INDEX "DojoChallengeHistory_dojoId_idx" ON "DojoChallengeHistory"("dojoId");

-- AddForeignKey
ALTER TABLE "dojo" ADD CONSTRAINT "dojo_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DojoTeam" ADD CONSTRAINT "DojoTeam_dojoId_fkey" FOREIGN KEY ("dojoId") REFERENCES "dojo"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DojoTeam" ADD CONSTRAINT "DojoTeam_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DojoOpponents" ADD CONSTRAINT "DojoOpponents_dojoId_fkey" FOREIGN KEY ("dojoId") REFERENCES "dojo"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DojoOpponents" ADD CONSTRAINT "DojoOpponents_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DojoChallengeHistory" ADD CONSTRAINT "DojoChallengeHistory_dojoId_fkey" FOREIGN KEY ("dojoId") REFERENCES "dojo"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
