import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	OneToOne,
	CreateDateColumn,
	UpdateDateColumn,
	Relation,
	JoinColumn
} from 'typeorm';
import {
	Player,
	ImportedDinoz,
	ImportedPlayerReward,
	ImportedPlayerScenario,
	ImportedPlayerIngredients
} from './index.js';
import { ImportedPlayerItem } from './import_playerItem.js';
import { DinoRPGProfile } from '@drpg/core/models/import/TwinoAPI';

@Entity()
export class ImportedPlayer {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => Player, player => player.import, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	player: Relation<Player>;

	@OneToMany(() => ImportedPlayerReward, reward => reward.player, {
		cascade: true
	})
	rewards: Relation<ImportedPlayerReward[]>;

	@OneToMany(() => ImportedDinoz, dinoz => dinoz.player, {
		cascade: true
	})
	dinoz: Relation<ImportedDinoz[]>;

	@OneToMany(() => ImportedPlayerItem, item => item.player, {
		cascade: true
	})
	items: Relation<ImportedPlayerItem[]>;

	@OneToMany(() => ImportedPlayerScenario, scenario => scenario.player, {
		cascade: true
	})
	scenario: Relation<ImportedPlayerScenario[]>;

	@OneToMany(() => ImportedPlayerIngredients, ingredients => ingredients.player, {
		cascade: true
	})
	ingredients: Relation<ImportedPlayerIngredients[]>;

	@Column({
		nullable: false
	})
	name: string;

	@Column()
	twinId: number;

	@Column({
		nullable: false
	})
	money: number;

	@CreateDateColumn()
	createdDate: Date;

	@UpdateDateColumn()
	updatedDate: Date;

	constructor(player: Player, data: DinoRPGProfile | undefined) {
		if (!player) return;
		this.player = player;
		if (!data) return;
		this.twinId = data.twinId;
		this.name = data.name;
		this.money = data.money;
	}
}
