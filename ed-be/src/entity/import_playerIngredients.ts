import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { ImportedPlayer } from './index.js';
import { objectAPI } from '@drpg/core/models/import/TwinoAPI';

@Entity()
export class ImportedPlayerIngredients {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => ImportedPlayer, player => player.ingredients, {
		onDelete: 'CASCADE'
	})
	player: Relation<ImportedPlayer>;

	@Column({
		nullable: false
	})
	ingredientId: number;

	@Column({
		nullable: false
	})
	quantity: number;

	constructor(id: number, quantity: number) {
		this.ingredientId = id;
		this.quantity = quantity;
	}
}
