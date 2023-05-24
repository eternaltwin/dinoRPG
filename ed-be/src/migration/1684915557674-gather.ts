import { MigrationInterface, QueryRunner } from 'typeorm';

export class Gather1684915557674 implements MigrationInterface {
	name = 'Gather1684915557674';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "player_gather" ("id" SERIAL NOT NULL, "place" integer NOT NULL, "type" integer NOT NULL, "grid" integer array NOT NULL, "playerId" integer, CONSTRAINT "PK_aafad0867df96551953200209c7" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(`ALTER TABLE "dinoz_mission" DROP COLUMN "count"`);
		await queryRunner.query(
			`ALTER TABLE "player_gather" ADD CONSTRAINT "FK_86eed52f66f7126e4dc7a998cdf" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "player_gather" DROP CONSTRAINT "FK_86eed52f66f7126e4dc7a998cdf"`);
		await queryRunner.query(`ALTER TABLE "dinoz_mission" ADD "count" integer`);
		await queryRunner.query(`DROP TABLE "player_gather"`);
	}
}
