import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Player } from './index.js';

@Entity()
export class PlayerDinozShop {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Player, player => player.dinozShop, {
		onDelete: 'CASCADE'
	})
	player: Relation<Player>;

	@Column({
		nullable: false
	})
	raceId: number;

	@Column({
		nullable: false
	})
	display: string;
}
