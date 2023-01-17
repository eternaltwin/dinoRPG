import { MigrationInterface, QueryRunner } from 'typeorm';

export class dinozMission1669794550885 implements MigrationInterface {
	name = 'dinozMission1669794550885';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz_mission" ADD "step" integer NOT NULL`);
		await queryRunner.query(`ALTER TABLE "dinoz_mission" ADD "isFinished" boolean`);
		await queryRunner.query(`ALTER TABLE "dinoz_mission" ADD "count" integer`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz_mission" DROP COLUMN "count"`);
		await queryRunner.query(`ALTER TABLE "dinoz_mission" DROP COLUMN "isFinished"`);
		await queryRunner.query(`ALTER TABLE "dinoz_mission" DROP COLUMN "step"`);
	}
}
