import { MigrationInterface, QueryRunner } from 'typeorm';

export class AchievementStat1698410652608 implements MigrationInterface {
	name = 'AchievementStat1698410652608';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "imported_twinoid_achievements" ADD "requirement" character varying NOT NULL`);
		await queryRunner.query(`ALTER TABLE "imported_twinoid_achievements" ADD "quantity" integer NOT NULL`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "imported_twinoid_achievements" DROP COLUMN "quantity"`);
		await queryRunner.query(`ALTER TABLE "imported_twinoid_achievements" DROP COLUMN "requirement"`);
	}
}
