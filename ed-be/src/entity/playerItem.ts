import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Player } from './index.js';

@Entity()
export class PlayerItem {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Player, player => player.items, {
		onDelete: 'CASCADE'
	})
	player: Relation<Player>;

	@Column({
		nullable: false
	})
	itemId: number;

	@Column({
		nullable: false
	})
	quantity: number;

	constructor(player: Player, itemId: number, quantity: number) {
		this.player = player;
		this.itemId = itemId;
		this.quantity = quantity;
	}
}
