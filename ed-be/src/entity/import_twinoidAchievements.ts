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
import { SiteAchiev } from '@drpg/core/models/import/siteAchiev';

@Entity()
export class ImportedTwinoidAchievements {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Player, player => player.twinoAchievement, {
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
	date: string;

	@Column({
		nullable: false
	})
	nameId: string;

	@Column({
		nullable: false
	})
	requirement: string;

	@Column({
		nullable: false
	})
	quantity: number;

	@CreateDateColumn()
	createdDate: Date;

	@UpdateDateColumn()
	updatedDate: Date;

	public toSiteAchiev(): SiteAchiev {
		return {
			name: this.nameId,
			requirement: this.requirement,
			quantity: this.quantity
		};
	}
}
