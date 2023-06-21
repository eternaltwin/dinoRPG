import { MigrationInterface, QueryRunner } from 'typeorm';

export class CanGather1687095150673 implements MigrationInterface {
	name = 'CanGather1687095150673';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz" DROP COLUMN "canGather"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz" ADD "canGather" boolean NOT NULL DEFAULT false`);
	}
}
