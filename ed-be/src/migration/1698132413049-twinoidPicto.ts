import { MigrationInterface, QueryRunner } from 'typeorm';

export class TwinoidPicto1698132413049 implements MigrationInterface {
	name = 'TwinoidPicto1698132413049';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "imported_twinoid_stats" ("id" SERIAL NOT NULL, "siteId" integer NOT NULL, "score" integer NOT NULL, "nameId" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer, CONSTRAINT "PK_8b3e084a6917445a324d12c382d" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "imported_twinoid_achievements" ("id" SERIAL NOT NULL, "siteId" integer NOT NULL, "date" character varying NOT NULL, "nameId" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer, CONSTRAINT "PK_2f068d951f9cc9764221e649206" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "imported_twinoid_site" ("id" SERIAL NOT NULL, "siteId" integer NOT NULL, "npoints" integer NOT NULL, "points" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer, CONSTRAINT "PK_c5bbb1c1ff466442f1eb4c48078" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "imported_twinoid_stats" ADD CONSTRAINT "FK_bcfa9706d0fd62569a7e9aeaf27" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "imported_twinoid_achievements" ADD CONSTRAINT "FK_50282b160872353eda6276418d1" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "imported_twinoid_site" ADD CONSTRAINT "FK_8035669ec1e7b5a0b09d4c76db7" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "imported_twinoid_site" DROP CONSTRAINT "FK_8035669ec1e7b5a0b09d4c76db7"`);
		await queryRunner.query(
			`ALTER TABLE "imported_twinoid_achievements" DROP CONSTRAINT "FK_50282b160872353eda6276418d1"`
		);
		await queryRunner.query(`ALTER TABLE "imported_twinoid_stats" DROP CONSTRAINT "FK_bcfa9706d0fd62569a7e9aeaf27"`);
		await queryRunner.query(`DROP TABLE "imported_twinoid_site"`);
		await queryRunner.query(`DROP TABLE "imported_twinoid_achievements"`);
		await queryRunner.query(`DROP TABLE "imported_twinoid_stats"`);
	}
}
