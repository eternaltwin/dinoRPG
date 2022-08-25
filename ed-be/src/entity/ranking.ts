import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, Relation } from 'typeorm';
import { Player } from './player.js';

@Entity()
export class Ranking {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => Player, player => player.rank, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	player: Relation<Player>;

	@Column({
		default: 0
	})
	sumPosition: number;

	@Column({
		default: 0
	})
	sumPoints!: number;

	@Column({
		default: 0
	})
	sumPointsDisplayed!: number;

	@Column({
		default: 0
	})
	averagePosition!: number;

	@Column({
		default: 0
	})
	averagePoints!: number;

	@Column({
		default: 0
	})
	averagePointsDisplayed!: number;

	@Column({
		default: 0
	})
	dinozCount!: number;

	@Column({
		default: 0
	})
	dinozCountDisplayed!: number;
}
