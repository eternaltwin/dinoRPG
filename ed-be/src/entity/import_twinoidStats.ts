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
import { SiteStat } from '@drpg/core/models/import/siteStat';

@Entity()
export class ImportedTwinoidStats {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Player, player => player.twinoStats, {
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
	score: number;

	@Column({
		nullable: false
	})
	nameId: string;

	@CreateDateColumn()
	createdDate: Date;

	@UpdateDateColumn()
	updatedDate: Date;

	public toSiteStat(): SiteStat {
		return {
			name: this.nameId,
			score: this.score
		};
	}
}
