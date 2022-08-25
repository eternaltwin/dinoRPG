import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Player } from './index.js';

@Entity()
export class PlayerQuest {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Player, player => player.quests, {
		onDelete: 'CASCADE'
	})
	player: Relation<Player>;

	@Column({
		nullable: false
	})
	questId: number;

	@Column({
		nullable: false
	})
	progression: number;
}
