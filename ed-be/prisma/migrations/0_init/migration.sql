-- CreateTable
CREATE TABLE "concentration" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "PK_8e5d1783d48bab689b191b0d2af" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dinoz" (
    "id" SERIAL NOT NULL,
    "following" INTEGER,
    "name" VARCHAR NOT NULL,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "isSacrificed" BOOLEAN NOT NULL DEFAULT false,
    "raceId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "missionId" INTEGER,
    "nextUpElementId" INTEGER NOT NULL,
    "nextUpAltElementId" INTEGER NOT NULL,
    "placeId" INTEGER NOT NULL,
    "canChangeName" BOOLEAN NOT NULL,
    "display" VARCHAR NOT NULL,
    "life" INTEGER NOT NULL,
    "maxLife" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,
    "nbrUpFire" INTEGER NOT NULL,
    "nbrUpWood" INTEGER NOT NULL,
    "nbrUpWater" INTEGER NOT NULL,
    "nbrUpLightning" INTEGER NOT NULL,
    "nbrUpAir" INTEGER NOT NULL,
    "createdDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" INTEGER,
    "order" INTEGER,
    "concentrationId" INTEGER,

    CONSTRAINT "PK_297ca7f55b56853c204d8301fb6" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dinoz_item" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "dinozId" INTEGER,

    CONSTRAINT "PK_c02e01190111511642a4c3538f0" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dinoz_items_dinoz_item" (
    "dinozId" INTEGER NOT NULL,
    "dinozItemId" INTEGER NOT NULL,

    CONSTRAINT "PK_e7161ad9702ca574280cf1a1617" PRIMARY KEY ("dinozId","dinozItemId")
);

-- CreateTable
CREATE TABLE "dinoz_mission" (
    "id" SERIAL NOT NULL,
    "missionId" INTEGER NOT NULL,
    "dinozId" INTEGER,
    "step" INTEGER NOT NULL,
    "isFinished" BOOLEAN,
    "progress" INTEGER,

    CONSTRAINT "PK_dfeb1245e68d72db9a6c9402ab7" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dinoz_skill" (
    "id" SERIAL NOT NULL,
    "skillId" INTEGER NOT NULL,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "dinozId" INTEGER,

    CONSTRAINT "PK_c4109fad8627da673d3614fbc01" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dinoz_skill_unlockable" (
    "id" SERIAL NOT NULL,
    "skillId" INTEGER NOT NULL,
    "dinozId" INTEGER,

    CONSTRAINT "PK_f61132504207a4379a96a324e93" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dinoz_status" (
    "id" SERIAL NOT NULL,
    "statusId" INTEGER NOT NULL,
    "dinozId" INTEGER,

    CONSTRAINT "PK_149653f1934603aede93803c9de" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_dinoz" (
    "id" SERIAL NOT NULL,
    "importedId" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "isSacrificed" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER NOT NULL,
    "display" VARCHAR NOT NULL,
    "life" INTEGER NOT NULL,
    "maxLife" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,
    "nbrUpFire" INTEGER NOT NULL,
    "nbrUpWood" INTEGER NOT NULL,
    "nbrUpWater" INTEGER NOT NULL,
    "nbrUpLightning" INTEGER NOT NULL,
    "nbrUpAir" INTEGER NOT NULL,
    "createdDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" INTEGER,
    "isFrozen" BOOLEAN NOT NULL,

    CONSTRAINT "PK_ac97d6b0ae8b55980f5caaacb3d" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_dinoz_skill" (
    "id" SERIAL NOT NULL,
    "skillId" INTEGER NOT NULL,
    "dinozId" INTEGER,

    CONSTRAINT "PK_6b3eb5c2d481d86de754a07ece9" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_dinoz_status" (
    "id" SERIAL NOT NULL,
    "dinozId" INTEGER,
    "statusId" INTEGER NOT NULL,

    CONSTRAINT "PK_24b93fc1ae51e002bd4affccf88" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_player" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "twinId" INTEGER NOT NULL,
    "money" INTEGER NOT NULL,
    "createdDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" INTEGER,

    CONSTRAINT "PK_a754b050a93ed32ba1908d8fe84" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_player_ingredients" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "playerId" INTEGER,

    CONSTRAINT "PK_22fed52412e1953f761a38ce27c" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_player_item" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "playerId" INTEGER,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "PK_d85684b37ac3e044d15ea95e16f" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_player_reward" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER,
    "rewardId" INTEGER NOT NULL,

    CONSTRAINT "PK_c6b0c5f9aeb412ee12f0309d299" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_player_scenario" (
    "id" SERIAL NOT NULL,
    "questName" VARCHAR NOT NULL,
    "progression" INTEGER NOT NULL,
    "playerId" INTEGER,

    CONSTRAINT "PK_84a5181a8d3f0255bcf9ab904c4" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_twinoid_achievements" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "date" VARCHAR NOT NULL,
    "nameId" VARCHAR NOT NULL,
    "createdDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" INTEGER,
    "requirement" VARCHAR NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "PK_2f068d951f9cc9764221e649206" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_twinoid_site" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "npoints" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" INTEGER,

    CONSTRAINT "PK_c5bbb1c1ff466442f1eb4c48078" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_twinoid_stats" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "nameId" VARCHAR NOT NULL,
    "createdDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" INTEGER,

    CONSTRAINT "PK_8b3e084a6917445a324d12c382d" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR,
    "image" BYTEA,
    "frenchTitle" VARCHAR,
    "frenchText" VARCHAR,
    "englishTitle" VARCHAR,
    "englishText" VARCHAR,
    "spanishTitle" VARCHAR,
    "spanishText" VARCHAR,
    "germanTitle" VARCHAR,
    "germanText" VARCHAR,
    "createdDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "npc" (
    "id" SERIAL NOT NULL,
    "npcId" INTEGER NOT NULL,
    "step" VARCHAR NOT NULL,
    "dinozId" INTEGER,

    CONSTRAINT "PK_f88acee050bfea2111b399ab49b" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player" (
    "id" SERIAL NOT NULL,
    "hasImported" BOOLEAN NOT NULL,
    "customText" TEXT,
    "name" VARCHAR NOT NULL,
    "eternalTwinId" VARCHAR NOT NULL,
    "money" INTEGER NOT NULL,
    "quetzuBought" INTEGER NOT NULL,
    "leader" BOOLEAN NOT NULL,
    "engineer" BOOLEAN NOT NULL,
    "cooker" BOOLEAN NOT NULL,
    "shopKeeper" BOOLEAN NOT NULL,
    "merchant" BOOLEAN NOT NULL,
    "priest" BOOLEAN NOT NULL,
    "teacher" BOOLEAN NOT NULL,
    "createdDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_dinoz_shop" (
    "id" SERIAL NOT NULL,
    "raceId" INTEGER NOT NULL,
    "display" VARCHAR NOT NULL,
    "playerId" INTEGER,

    CONSTRAINT "PK_046dc73096360ffb3c1cca7fe72" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_gather" (
    "id" SERIAL NOT NULL,
    "place" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "grid" INTEGER[],
    "playerId" INTEGER,

    CONSTRAINT "PK_aafad0867df96551953200209c7" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_ingredient" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "playerId" INTEGER,

    CONSTRAINT "PK_3ae5ca9730144d7456c16386869" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_item" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "playerId" INTEGER,

    CONSTRAINT "PK_47496d16c61f1b09af5c2399993" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_quest" (
    "id" SERIAL NOT NULL,
    "questId" INTEGER NOT NULL,
    "progression" INTEGER NOT NULL,
    "playerId" INTEGER,

    CONSTRAINT "PK_8cb4cc9b423807c511f24c0faa3" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_reward" (
    "id" SERIAL NOT NULL,
    "rewardId" INTEGER NOT NULL,
    "playerId" INTEGER,

    CONSTRAINT "PK_6602753ecef4920f197de910599" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking" (
    "id" SERIAL NOT NULL,
    "sumPosition" INTEGER NOT NULL DEFAULT 0,
    "sumPoints" INTEGER NOT NULL DEFAULT 0,
    "sumPointsDisplayed" INTEGER NOT NULL DEFAULT 0,
    "averagePosition" INTEGER NOT NULL DEFAULT 0,
    "averagePoints" INTEGER NOT NULL DEFAULT 0,
    "averagePointsDisplayed" INTEGER NOT NULL DEFAULT 0,
    "dinozCount" INTEGER NOT NULL DEFAULT 0,
    "dinozCountDisplayed" INTEGER NOT NULL DEFAULT 0,
    "playerId" INTEGER,

    CONSTRAINT "PK_bf82b8f271e50232e6a3fcb09a9" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secret" (
    "key" VARCHAR NOT NULL,
    "value" VARCHAR NOT NULL,

    CONSTRAINT "secret_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "IDX_4e81bd56b675264ba5f30a5f10" ON "dinoz_items_dinoz_item"("dinozId");

-- CreateIndex
CREATE INDEX "IDX_e90f6271f11b3522312139ef3a" ON "dinoz_items_dinoz_item"("dinozItemId");

-- CreateIndex
CREATE UNIQUE INDEX "REL_97b48349be6078fa1d0f0eb877" ON "imported_player"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "REL_3ac96196d0a3851989be8c52a9" ON "ranking"("playerId");

-- AddForeignKey
ALTER TABLE "dinoz" ADD CONSTRAINT "FK_064135f23ecaf0207af9926d7c9" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dinoz" ADD CONSTRAINT "FK_693d1e839cbd13471ff3721b994" FOREIGN KEY ("concentrationId") REFERENCES "concentration"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dinoz_item" ADD CONSTRAINT "FK_37055da55534196f2248a1b5c6d" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dinoz_items_dinoz_item" ADD CONSTRAINT "FK_4e81bd56b675264ba5f30a5f109" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dinoz_items_dinoz_item" ADD CONSTRAINT "FK_e90f6271f11b3522312139ef3a9" FOREIGN KEY ("dinozItemId") REFERENCES "dinoz_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dinoz_mission" ADD CONSTRAINT "FK_f408ddb692ab5519808f24fb2b7" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dinoz_skill" ADD CONSTRAINT "FK_5662d0ad643e55696f10bcbc858" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dinoz_skill_unlockable" ADD CONSTRAINT "FK_db6b95479693f3e4b5948800cf8" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dinoz_status" ADD CONSTRAINT "FK_ec5230fd4ad653770e13558df7d" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "imported_dinoz" ADD CONSTRAINT "FK_b52fe496437841d0af36c9377c8" FOREIGN KEY ("playerId") REFERENCES "imported_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "imported_dinoz_skill" ADD CONSTRAINT "FK_6c23c77389c410949f7317585b5" FOREIGN KEY ("dinozId") REFERENCES "imported_dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "imported_dinoz_status" ADD CONSTRAINT "FK_edb147edc96c7814e88d8dc3544" FOREIGN KEY ("dinozId") REFERENCES "imported_dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "imported_player" ADD CONSTRAINT "FK_97b48349be6078fa1d0f0eb8778" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "imported_player_ingredients" ADD CONSTRAINT "FK_18eaf3ec2ed7576bfb676c6dab5" FOREIGN KEY ("playerId") REFERENCES "imported_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "imported_player_item" ADD CONSTRAINT "FK_3df6f968a129fe0311f01d00338" FOREIGN KEY ("playerId") REFERENCES "imported_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "imported_player_reward" ADD CONSTRAINT "FK_63c119aab5f6d9990f2b10062c3" FOREIGN KEY ("playerId") REFERENCES "imported_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "imported_player_scenario" ADD CONSTRAINT "FK_24b0dbe4c862c2f651d8795f65a" FOREIGN KEY ("playerId") REFERENCES "imported_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "imported_twinoid_achievements" ADD CONSTRAINT "FK_50282b160872353eda6276418d1" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "imported_twinoid_site" ADD CONSTRAINT "FK_8035669ec1e7b5a0b09d4c76db7" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "imported_twinoid_stats" ADD CONSTRAINT "FK_bcfa9706d0fd62569a7e9aeaf27" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "npc" ADD CONSTRAINT "FK_90ce8a070feaea28d5a39295762" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_dinoz_shop" ADD CONSTRAINT "FK_c79ab61aa32fe6e81c03a7d87d1" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_gather" ADD CONSTRAINT "FK_86eed52f66f7126e4dc7a998cdf" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_ingredient" ADD CONSTRAINT "FK_ad198392886a52e7f184474a0d6" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_item" ADD CONSTRAINT "FK_21535fcb93f8613fd893b74b08b" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_quest" ADD CONSTRAINT "FK_1b5b041fab3362c845c142ca3b0" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_reward" ADD CONSTRAINT "FK_9cf142b3a6fa3e0faec7f8debfb" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ranking" ADD CONSTRAINT "FK_3ac96196d0a3851989be8c52a9a" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

