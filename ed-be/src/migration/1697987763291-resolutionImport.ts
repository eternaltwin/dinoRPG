import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResolutionImport1697987763291 implements MigrationInterface {
	name = 'ResolutionImport1697987763291';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "imported_player_item" DROP COLUMN "itemId"`);
		await queryRunner.query(`ALTER TABLE "imported_player_item" ADD "itemId" integer NOT NULL`);
		await queryRunner.query(`ALTER TABLE "imported_player_reward" DROP COLUMN "rewardId"`);
		await queryRunner.query(`ALTER TABLE "imported_player_reward" ADD "rewardId" integer NOT NULL`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "imported_player_reward" DROP COLUMN "rewardId"`);
		await queryRunner.query(`ALTER TABLE "imported_player_reward" ADD "rewardId" character varying NOT NULL`);
		await queryRunner.query(`ALTER TABLE "imported_player_item" DROP COLUMN "itemId"`);
		await queryRunner.query(`ALTER TABLE "imported_player_item" ADD "itemId" character varying NOT NULL`);
	}
}
