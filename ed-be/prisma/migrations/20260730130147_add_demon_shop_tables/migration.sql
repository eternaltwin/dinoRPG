-- CreateTable
CREATE TABLE "player_demon_shop" (
    "id" SERIAL NOT NULL,
    "raceId" INTEGER NOT NULL,
    "display" VARCHAR NOT NULL,
    "playerId" UUID,

    CONSTRAINT "player_demon_shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demon_skill" (
    "id" SERIAL NOT NULL,
    "skillId" INTEGER NOT NULL,
    "dinozId" INTEGER NOT NULL,

    CONSTRAINT "demon_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demon_skill_unlockable" (
    "id" SERIAL NOT NULL,
    "skillId" INTEGER NOT NULL,
    "dinozId" INTEGER NOT NULL,

    CONSTRAINT "demon_skill_unlockable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "demon_skill_skillId_dinozId_key" ON "demon_skill"("skillId", "dinozId");

-- CreateIndex
CREATE UNIQUE INDEX "demon_skill_unlockable_skillId_dinozId_key" ON "demon_skill_unlockable"("skillId", "dinozId");

-- AddForeignKey
ALTER TABLE "player_demon_shop" ADD CONSTRAINT "player_demon_shop_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "demon_skill" ADD CONSTRAINT "demon_skill_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "player_demon_shop"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "demon_skill_unlockable" ADD CONSTRAINT "demon_skill_unlockable_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "player_demon_shop"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
