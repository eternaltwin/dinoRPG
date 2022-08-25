import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Player } from './index.js';

@Entity()
export class PlayerReward {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Player, player => player.rewards, {
		onDelete: 'CASCADE'
	})
	player: Relation<Player>;

	@Column({
		nullable: false
	})
	rewardId: number;

	constructor(player: Player, rewardId: number) {
		this.player = player;
		this.rewardId = rewardId;
	}
}
