import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImportedIngredient1697786886779 implements MigrationInterface {
	name = 'ImportedIngredient1697786886779';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "imported_player_ingredients" ("id" SERIAL NOT NULL, "ingredientId" integer NOT NULL, "quantity" integer NOT NULL, "playerId" integer, CONSTRAINT "PK_22fed52412e1953f761a38ce27c" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "imported_player_ingredients" ADD CONSTRAINT "FK_18eaf3ec2ed7576bfb676c6dab5" FOREIGN KEY ("playerId") REFERENCES "imported_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "imported_player_ingredients" DROP CONSTRAINT "FK_18eaf3ec2ed7576bfb676c6dab5"`
		);
		await queryRunner.query(`DROP TABLE "imported_player_ingredients"`);
	}
}
