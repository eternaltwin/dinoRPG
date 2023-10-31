import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImportFrozenDinoz1698102040805 implements MigrationInterface {
	name = 'ImportFrozenDinoz1698102040805';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "imported_dinoz" ADD "isFrozen" boolean NOT NULL`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "imported_dinoz" DROP COLUMN "isFrozen"`);
	}
}
