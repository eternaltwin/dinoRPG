import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Player } from './index.js';

@Entity()
export class PlayerIngredient {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Player, player => player.ingredients, {
		onDelete: 'CASCADE'
	})
	player: Relation<Player>;

	@Column({
		nullable: false
	})
	ingredientId: number;

	@Column({
		nullable: false
	})
	quantity: number;

	constructor(player: Player, ingredientId: number, quantity: number) {
		this.player = player;
		this.ingredientId = ingredientId;
		this.quantity = quantity;
	}

	public changeIngredientQuantity(quantity: number): Partial<PlayerIngredient> {
		return {
			id: this.id,
			ingredientId: this.ingredientId,
			quantity: this.quantity + quantity
		};
	}
}
