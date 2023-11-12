import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Player } from './index.js';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { ErrorFormator } from '../utils/errorFormator.js';
import { raceList } from '@drpg/core/models/dinoz/RaceList';

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

	get race(): DinozRace {
		return Object.values(raceList).find(race => race.raceId === this.raceId)!;
	}

	public belongToPlayer(playerToTest: number | undefined): void {
		if (this.player.id !== playerToTest) {
			throw new ErrorFormator(500, `Dinoz ${this.id} doesn't belong to player ${playerToTest}`);
		}
	}
}
