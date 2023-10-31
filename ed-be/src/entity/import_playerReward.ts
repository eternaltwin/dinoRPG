import { Entity, JoinColumn, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { ImportedPlayer } from './index.js';
import { collectionAPI } from '@drpg/core/models/import/TwinoAPI';

@Entity()
export class ImportedPlayerReward {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => ImportedPlayer, player => player.rewards, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	player: Relation<ImportedPlayer>;

	@Column({
		nullable: false
	})
	rewardId: number;

	constructor(rewardId: number) {
		this.rewardId = rewardId;
	}
}
