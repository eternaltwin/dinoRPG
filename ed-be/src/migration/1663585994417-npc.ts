import { MigrationInterface, QueryRunner } from 'typeorm';

export class npc1663585994417 implements MigrationInterface {
	name = 'npc1663585994417';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "npc" ("id" SERIAL NOT NULL, "npcId" integer NOT NULL, "step" character varying NOT NULL, "dinozId" integer, CONSTRAINT "PK_f88acee050bfea2111b399ab49b" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "npc" ADD CONSTRAINT "FK_90ce8a070feaea28d5a39295762" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "npc" DROP CONSTRAINT "FK_90ce8a070feaea28d5a39295762"`);
		await queryRunner.query(`DROP TABLE "npc"`);
	}
}
