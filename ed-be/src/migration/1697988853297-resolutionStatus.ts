import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResolutionStatus1697988853297 implements MigrationInterface {
	name = 'ResolutionStatus1697988853297';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "imported_dinoz_status" RENAME COLUMN "statusName" TO "statusId"`);
		await queryRunner.query(`ALTER TABLE "imported_dinoz_status" DROP COLUMN "statusId"`);
		await queryRunner.query(`ALTER TABLE "imported_dinoz_status" ADD "statusId" integer NOT NULL`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "imported_dinoz_status" DROP COLUMN "statusId"`);
		await queryRunner.query(`ALTER TABLE "imported_dinoz_status" ADD "statusId" character varying NOT NULL`);
		await queryRunner.query(`ALTER TABLE "imported_dinoz_status" RENAME COLUMN "statusId" TO "statusName"`);
	}
}
