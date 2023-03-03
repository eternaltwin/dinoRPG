import { MigrationInterface, QueryRunner } from 'typeorm';

export class dinozMissionProgress1676990054926 implements MigrationInterface {
	name = 'dinozMissionProgress1676990054926';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz_mission" ADD "progress" integer`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz_mission" DROP COLUMN "progress"`);
	}
}
