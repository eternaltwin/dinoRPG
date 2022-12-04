import { MigrationInterface, QueryRunner } from 'typeorm';

export class dinozlist1668759095835 implements MigrationInterface {
	name = 'dinozlist1668759095835';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz" ADD "order" integer`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz" DROP COLUMN "order"`);
	}
}
