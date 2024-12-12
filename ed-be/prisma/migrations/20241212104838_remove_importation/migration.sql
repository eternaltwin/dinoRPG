/*
  Warnings:

  - You are about to drop the `imported_dinoz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imported_dinoz_skill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imported_dinoz_status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imported_player` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imported_player_ingredients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imported_player_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imported_player_reward` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imported_player_scenario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imported_twinoid_achievements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imported_twinoid_site` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imported_twinoid_stats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "imported_dinoz" DROP CONSTRAINT "FK_b52fe496437841d0af36c9377c8";

-- DropForeignKey
ALTER TABLE "imported_dinoz_skill" DROP CONSTRAINT "FK_6c23c77389c410949f7317585b5";

-- DropForeignKey
ALTER TABLE "imported_dinoz_status" DROP CONSTRAINT "FK_edb147edc96c7814e88d8dc3544";

-- DropForeignKey
ALTER TABLE "imported_player" DROP CONSTRAINT "FK_97b48349be6078fa1d0f0eb8778";

-- DropForeignKey
ALTER TABLE "imported_player_ingredients" DROP CONSTRAINT "FK_18eaf3ec2ed7576bfb676c6dab5";

-- DropForeignKey
ALTER TABLE "imported_player_item" DROP CONSTRAINT "FK_3df6f968a129fe0311f01d00338";

-- DropForeignKey
ALTER TABLE "imported_player_reward" DROP CONSTRAINT "FK_63c119aab5f6d9990f2b10062c3";

-- DropForeignKey
ALTER TABLE "imported_player_scenario" DROP CONSTRAINT "FK_24b0dbe4c862c2f651d8795f65a";

-- DropForeignKey
ALTER TABLE "imported_twinoid_achievements" DROP CONSTRAINT "FK_50282b160872353eda6276418d1";

-- DropForeignKey
ALTER TABLE "imported_twinoid_site" DROP CONSTRAINT "FK_8035669ec1e7b5a0b09d4c76db7";

-- DropForeignKey
ALTER TABLE "imported_twinoid_stats" DROP CONSTRAINT "FK_bcfa9706d0fd62569a7e9aeaf27";

-- DropTable
DROP TABLE "imported_dinoz";

-- DropTable
DROP TABLE "imported_dinoz_skill";

-- DropTable
DROP TABLE "imported_dinoz_status";

-- DropTable
DROP TABLE "imported_player";

-- DropTable
DROP TABLE "imported_player_ingredients";

-- DropTable
DROP TABLE "imported_player_item";

-- DropTable
DROP TABLE "imported_player_reward";

-- DropTable
DROP TABLE "imported_player_scenario";

-- DropTable
DROP TABLE "imported_twinoid_achievements";

-- DropTable
DROP TABLE "imported_twinoid_site";

-- DropTable
DROP TABLE "imported_twinoid_stats";
