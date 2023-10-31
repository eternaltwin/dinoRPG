import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	Relation,
	JoinColumn
} from 'typeorm';
import { Player } from './index.js';
import { TwinoStat } from '@drpg/core/models/import/twinoStat';

@Entity()
export class ImportedTwinoidSite {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Player, player => player.twinosite, {
		cascade: true
	})
	@JoinColumn()
	player: Relation<Player>;

	@Column({
		nullable: false
	})
	siteId: number;

	@Column({
		nullable: false
	})
	npoints: number;

	@Column({
		nullable: false
	})
	points: number;

	@CreateDateColumn()
	createdDate: Date;

	@UpdateDateColumn()
	updatedDate: Date;

	public toTwinoStat(): TwinoStat {
		return {
			siteId: this.siteId,
			npoints: this.npoints
		};
	}
}
