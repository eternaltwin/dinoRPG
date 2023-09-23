import { MigrationInterface, QueryRunner } from 'typeorm';

export class DinozItem1689806695683 implements MigrationInterface {
	name = 'DinozItem1689806695683';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz_item" ADD "dinozId" integer`);
		await queryRunner.query(
			`ALTER TABLE "dinoz_item" ADD CONSTRAINT "FK_37055da55534196f2248a1b5c6d" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "dinoz_item" DROP CONSTRAINT "FK_37055da55534196f2248a1b5c6d"`);
		await queryRunner.query(`ALTER TABLE "dinoz_item" DROP COLUMN "dinozId"`);
	}
}
