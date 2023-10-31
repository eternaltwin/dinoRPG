import { MigrationInterface, QueryRunner } from 'typeorm';

export class Secret1697485919266 implements MigrationInterface {
	name = 'Secret1697485919266';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "secret" ("key" character varying NOT NULL, "value" character varying NOT NULL, PRIMARY KEY ("key"))`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "secret"`);
	}
}
