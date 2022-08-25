import { MigrationInterface, QueryRunner } from 'typeorm';

export class creation1658320398507 implements MigrationInterface {
	name = 'creation1658320398507';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "ranking" ("id" SERIAL NOT NULL, "sumPosition" integer NOT NULL DEFAULT '0', "sumPoints" integer NOT NULL DEFAULT '0', "sumPointsDisplayed" integer NOT NULL DEFAULT '0', "averagePosition" integer NOT NULL DEFAULT '0', "averagePoints" integer NOT NULL DEFAULT '0', "averagePointsDisplayed" integer NOT NULL DEFAULT '0', "dinozCount" integer NOT NULL DEFAULT '0', "dinozCountDisplayed" integer NOT NULL DEFAULT '0', "playerId" integer, CONSTRAINT "REL_3ac96196d0a3851989be8c52a9" UNIQUE ("playerId"), CONSTRAINT "PK_bf82b8f271e50232e6a3fcb09a9" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "player" ("id" SERIAL NOT NULL, "hasImported" boolean NOT NULL, "customText" text, "name" character varying NOT NULL, "eternalTwinId" character varying NOT NULL, "money" integer NOT NULL, "quetzuBought" integer NOT NULL, "leader" boolean NOT NULL, "engineer" boolean NOT NULL, "cooker" boolean NOT NULL, "shopKeeper" boolean NOT NULL, "merchant" boolean NOT NULL, "priest" boolean NOT NULL, "teacher" boolean NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "dinoz" ("id" SERIAL NOT NULL, "following" integer, "name" character varying NOT NULL, "isFrozen" boolean NOT NULL DEFAULT false, "isSacrificed" boolean NOT NULL DEFAULT false, "raceId" integer NOT NULL, "level" integer NOT NULL, "missionId" integer, "nextUpElementId" integer NOT NULL, "nextUpAltElementId" integer NOT NULL, "placeId" integer NOT NULL, "canChangeName" boolean NOT NULL, "display" character varying NOT NULL, "life" integer NOT NULL, "maxLife" integer NOT NULL, "experience" integer NOT NULL, "canGather" boolean NOT NULL DEFAULT false, "nbrUpFire" integer NOT NULL, "nbrUpWood" integer NOT NULL, "nbrUpWater" integer NOT NULL, "nbrUpLightning" integer NOT NULL, "nbrUpAir" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer, CONSTRAINT "PK_297ca7f55b56853c204d8301fb6" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "dinoz_item" ("id" SERIAL NOT NULL, "itemId" integer NOT NULL, CONSTRAINT "PK_c02e01190111511642a4c3538f0" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "player_dinoz_shop" ("id" SERIAL NOT NULL, "raceId" integer NOT NULL, "display" character varying NOT NULL, "playerId" integer, CONSTRAINT "PK_046dc73096360ffb3c1cca7fe72" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "player_ingredient" ("id" SERIAL NOT NULL, "ingredientId" integer NOT NULL, "quantity" integer NOT NULL, "playerId" integer, CONSTRAINT "PK_3ae5ca9730144d7456c16386869" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "player_item" ("id" SERIAL NOT NULL, "itemId" integer NOT NULL, "quantity" integer NOT NULL, "playerId" integer, CONSTRAINT "PK_47496d16c61f1b09af5c2399993" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "dinoz_mission" ("id" SERIAL NOT NULL, "missionId" integer NOT NULL, "dinozId" integer, CONSTRAINT "PK_dfeb1245e68d72db9a6c9402ab7" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "news" ("id" SERIAL NOT NULL, "title" character varying, "image" bytea, "frenchTitle" character varying, "frenchText" character varying, "englishTitle" character varying, "englishText" character varying, "spanishTitle" character varying, "spanishText" character varying, "germanTitle" character varying, "germanText" character varying, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "player_quest" ("id" SERIAL NOT NULL, "questId" integer NOT NULL, "progression" integer NOT NULL, "playerId" integer, CONSTRAINT "PK_8cb4cc9b423807c511f24c0faa3" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "player_reward" ("id" SERIAL NOT NULL, "rewardId" integer NOT NULL, "playerId" integer, CONSTRAINT "PK_6602753ecef4920f197de910599" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "dinoz_skill" ("id" SERIAL NOT NULL, "skillId" integer NOT NULL, "state" boolean NOT NULL DEFAULT true, "dinozId" integer, CONSTRAINT "PK_c4109fad8627da673d3614fbc01" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "dinoz_skill_unlockable" ("id" SERIAL NOT NULL, "skillId" integer NOT NULL, "dinozId" integer, CONSTRAINT "PK_f61132504207a4379a96a324e93" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "dinoz_status" ("id" SERIAL NOT NULL, "statusId" integer NOT NULL, "dinozId" integer, CONSTRAINT "PK_149653f1934603aede93803c9de" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "dinoz_items_dinoz_item" ("dinozId" integer NOT NULL, "dinozItemId" integer NOT NULL, CONSTRAINT "PK_e7161ad9702ca574280cf1a1617" PRIMARY KEY ("dinozId", "dinozItemId"))`
		);
		await queryRunner.query(`CREATE INDEX "IDX_4e81bd56b675264ba5f30a5f10" ON "dinoz_items_dinoz_item" ("dinozId") `);
		await queryRunner.query(
			`CREATE INDEX "IDX_e90f6271f11b3522312139ef3a" ON "dinoz_items_dinoz_item" ("dinozItemId") `
		);
		await queryRunner.query(
			`ALTER TABLE "ranking" ADD CONSTRAINT "FK_3ac96196d0a3851989be8c52a9a" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "dinoz" ADD CONSTRAINT "FK_064135f23ecaf0207af9926d7c9" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "player_dinoz_shop" ADD CONSTRAINT "FK_c79ab61aa32fe6e81c03a7d87d1" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "player_ingredient" ADD CONSTRAINT "FK_ad198392886a52e7f184474a0d6" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "player_item" ADD CONSTRAINT "FK_21535fcb93f8613fd893b74b08b" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "dinoz_mission" ADD CONSTRAINT "FK_f408ddb692ab5519808f24fb2b7" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "player_quest" ADD CONSTRAINT "FK_1b5b041fab3362c845c142ca3b0" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "player_reward" ADD CONSTRAINT "FK_9cf142b3a6fa3e0faec7f8debfb" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "dinoz_skill" ADD CONSTRAINT "FK_5662d0ad643e55696f10bcbc858" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "dinoz_skill_unlockable" ADD CONSTRAINT "FK_db6b95479693f3e4b5948800cf8" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "dinoz_status" ADD CONSTRAINT "FK_ec5230fd4ad653770e13558df7d" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "dinoz_items_dinoz_item" ADD CONSTRAINT "FK_4e81bd56b675264ba5f30a5f109" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "dinoz_items_dinoz_item" ADD CONSTRAINT "FK_e90f6271f11b3522312139ef3a9" FOREIGN KEY ("dinozItemId") REFERENCES "dinoz_item"("id") ON DELETE CASCADE ON UPDATE CASCADE`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz_items_dinoz_item" DROP CONSTRAINT "FK_e90f6271f11b3522312139ef3a9"`);
		await queryRunner.query(`ALTER TABLE "dinoz_items_dinoz_item" DROP CONSTRAINT "FK_4e81bd56b675264ba5f30a5f109"`);
		await queryRunner.query(`ALTER TABLE "dinoz_status" DROP CONSTRAINT "FK_ec5230fd4ad653770e13558df7d"`);
		await queryRunner.query(`ALTER TABLE "dinoz_skill_unlockable" DROP CONSTRAINT "FK_db6b95479693f3e4b5948800cf8"`);
		await queryRunner.query(`ALTER TABLE "dinoz_skill" DROP CONSTRAINT "FK_5662d0ad643e55696f10bcbc858"`);
		await queryRunner.query(`ALTER TABLE "player_reward" DROP CONSTRAINT "FK_9cf142b3a6fa3e0faec7f8debfb"`);
		await queryRunner.query(`ALTER TABLE "player_quest" DROP CONSTRAINT "FK_1b5b041fab3362c845c142ca3b0"`);
		await queryRunner.query(`ALTER TABLE "dinoz_mission" DROP CONSTRAINT "FK_f408ddb692ab5519808f24fb2b7"`);
		await queryRunner.query(`ALTER TABLE "player_item" DROP CONSTRAINT "FK_21535fcb93f8613fd893b74b08b"`);
		await queryRunner.query(`ALTER TABLE "player_ingredient" DROP CONSTRAINT "FK_ad198392886a52e7f184474a0d6"`);
		await queryRunner.query(`ALTER TABLE "player_dinoz_shop" DROP CONSTRAINT "FK_c79ab61aa32fe6e81c03a7d87d1"`);
		await queryRunner.query(`ALTER TABLE "dinoz" DROP CONSTRAINT "FK_064135f23ecaf0207af9926d7c9"`);
		await queryRunner.query(`ALTER TABLE "ranking" DROP CONSTRAINT "FK_3ac96196d0a3851989be8c52a9a"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_e90f6271f11b3522312139ef3a"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_4e81bd56b675264ba5f30a5f10"`);
		await queryRunner.query(`DROP TABLE "dinoz_items_dinoz_item"`);
		await queryRunner.query(`DROP TABLE "dinoz_status"`);
		await queryRunner.query(`DROP TABLE "dinoz_skill_unlockable"`);
		await queryRunner.query(`DROP TABLE "dinoz_skill"`);
		await queryRunner.query(`DROP TABLE "player_reward"`);
		await queryRunner.query(`DROP TABLE "player_quest"`);
		await queryRunner.query(`DROP TABLE "news"`);
		await queryRunner.query(`DROP TABLE "dinoz_mission"`);
		await queryRunner.query(`DROP TABLE "player_item"`);
		await queryRunner.query(`DROP TABLE "player_ingredient"`);
		await queryRunner.query(`DROP TABLE "player_dinoz_shop"`);
		await queryRunner.query(`DROP TABLE "dinoz_item"`);
		await queryRunner.query(`DROP TABLE "dinoz"`);
		await queryRunner.query(`DROP TABLE "player"`);
		await queryRunner.query(`DROP TABLE "ranking"`);
	}
}
