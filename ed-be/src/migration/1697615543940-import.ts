import { MigrationInterface, QueryRunner } from 'typeorm';

export class Import1697615543940 implements MigrationInterface {
	name = 'Import1697615543940';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "imported_dinoz" ("id" SERIAL NOT NULL, "importedId" integer NOT NULL, "name" character varying NOT NULL, "isSacrificed" boolean NOT NULL DEFAULT false, "level" integer NOT NULL, "display" character varying NOT NULL, "life" integer NOT NULL, "maxLife" integer NOT NULL, "experience" integer NOT NULL, "nbrUpFire" integer NOT NULL, "nbrUpWood" integer NOT NULL, "nbrUpWater" integer NOT NULL, "nbrUpLightning" integer NOT NULL, "nbrUpAir" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer, CONSTRAINT "PK_ac97d6b0ae8b55980f5caaacb3d" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "imported_dinoz_skill" ("id" SERIAL NOT NULL, "skillId" integer NOT NULL, "dinozId" integer, CONSTRAINT "PK_6b3eb5c2d481d86de754a07ece9" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "imported_dinoz_status" ("id" SERIAL NOT NULL, "statusName" character varying NOT NULL, "dinozId" integer, CONSTRAINT "PK_24b93fc1ae51e002bd4affccf88" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "imported_player_item" ("id" SERIAL NOT NULL, "itemId" character varying NOT NULL, "quantity" integer NOT NULL, "playerId" integer, CONSTRAINT "PK_d85684b37ac3e044d15ea95e16f" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "imported_player_scenario" ("id" SERIAL NOT NULL, "questName" character varying NOT NULL, "progression" integer NOT NULL, "playerId" integer, CONSTRAINT "PK_84a5181a8d3f0255bcf9ab904c4" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "imported_player_reward" ("id" SERIAL NOT NULL, "rewardId" character varying NOT NULL, "playerId" integer, CONSTRAINT "PK_c6b0c5f9aeb412ee12f0309d299" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "imported_player" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "twinId" integer NOT NULL, "money" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer, CONSTRAINT "REL_97b48349be6078fa1d0f0eb877" UNIQUE ("playerId"), CONSTRAINT "PK_a754b050a93ed32ba1908d8fe84" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "imported_dinoz" ADD CONSTRAINT "FK_b52fe496437841d0af36c9377c8" FOREIGN KEY ("playerId") REFERENCES "imported_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "imported_dinoz_skill" ADD CONSTRAINT "FK_6c23c77389c410949f7317585b5" FOREIGN KEY ("dinozId") REFERENCES "imported_dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "imported_dinoz_status" ADD CONSTRAINT "FK_edb147edc96c7814e88d8dc3544" FOREIGN KEY ("dinozId") REFERENCES "imported_dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "imported_player_item" ADD CONSTRAINT "FK_3df6f968a129fe0311f01d00338" FOREIGN KEY ("playerId") REFERENCES "imported_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "imported_player_scenario" ADD CONSTRAINT "FK_24b0dbe4c862c2f651d8795f65a" FOREIGN KEY ("playerId") REFERENCES "imported_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "imported_player_reward" ADD CONSTRAINT "FK_63c119aab5f6d9990f2b10062c3" FOREIGN KEY ("playerId") REFERENCES "imported_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "imported_player" ADD CONSTRAINT "FK_97b48349be6078fa1d0f0eb8778" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "imported_player" DROP CONSTRAINT "FK_97b48349be6078fa1d0f0eb8778"`);
		await queryRunner.query(`ALTER TABLE "imported_player_reward" DROP CONSTRAINT "FK_63c119aab5f6d9990f2b10062c3"`);
		await queryRunner.query(`ALTER TABLE "imported_player_scenario" DROP CONSTRAINT "FK_24b0dbe4c862c2f651d8795f65a"`);
		await queryRunner.query(`ALTER TABLE "imported_player_item" DROP CONSTRAINT "FK_3df6f968a129fe0311f01d00338"`);
		await queryRunner.query(`ALTER TABLE "imported_dinoz_status" DROP CONSTRAINT "FK_edb147edc96c7814e88d8dc3544"`);
		await queryRunner.query(`ALTER TABLE "imported_dinoz_skill" DROP CONSTRAINT "FK_6c23c77389c410949f7317585b5"`);
		await queryRunner.query(`ALTER TABLE "imported_dinoz" DROP CONSTRAINT "FK_b52fe496437841d0af36c9377c8"`);
		await queryRunner.query(`DROP TABLE "imported_player"`);
		await queryRunner.query(`DROP TABLE "imported_player_reward"`);
		await queryRunner.query(`DROP TABLE "imported_player_scenario"`);
		await queryRunner.query(`DROP TABLE "imported_player_item"`);
		await queryRunner.query(`DROP TABLE "imported_dinoz_status"`);
		await queryRunner.query(`DROP TABLE "imported_dinoz_skill"`);
		await queryRunner.query(`DROP TABLE "imported_dinoz"`);
	}
}
