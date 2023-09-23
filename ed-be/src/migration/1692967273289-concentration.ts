import { MigrationInterface, QueryRunner } from 'typeorm';

export class Concentration1692967273289 implements MigrationInterface {
	name = 'Concentration1692967273289';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "concentration" ("id" SERIAL NOT NULL, CONSTRAINT "PK_8e5d1783d48bab689b191b0d2af" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(`ALTER TABLE "dinoz" ADD "concentrationId" integer`);
		await queryRunner.query(
			`ALTER TABLE "dinoz" ADD CONSTRAINT "FK_693d1e839cbd13471ff3721b994" FOREIGN KEY ("concentrationId") REFERENCES "concentration"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz" DROP CONSTRAINT "FK_693d1e839cbd13471ff3721b994"`);
		await queryRunner.query(`ALTER TABLE "dinoz" DROP COLUMN "concentrationId"`);
		await queryRunner.query(`DROP TABLE "concentration"`);
	}
}
