import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	OneToOne,
	CreateDateColumn,
	UpdateDateColumn,
	Relation
} from 'typeorm';
import { Ranking } from './ranking.js';
import { Dinoz, PlayerDinozShop, PlayerIngredient, PlayerItem, PlayerQuest, PlayerReward } from './index.js';

@Entity()
export class Player {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		nullable: false
	})
	hasImported: boolean;

	@OneToOne(() => Ranking, ranking => ranking.player, {
		cascade: true
	})
	rank: Relation<Ranking>;

	@OneToMany(() => PlayerReward, reward => reward.player)
	rewards: Relation<PlayerReward[]>;

	@OneToMany(() => Dinoz, dinoz => dinoz.player)
	dinoz: Relation<Dinoz[]>;

	@OneToMany(() => PlayerDinozShop, dinoz => dinoz.player)
	dinozShop: Relation<PlayerDinozShop[]>;

	@OneToMany(() => PlayerItem, dinoz => dinoz.player)
	items: Relation<PlayerItem[]>;

	@OneToMany(() => PlayerIngredient, dinoz => dinoz.player)
	ingredients: Relation<PlayerIngredient[]>;

	@OneToMany(() => PlayerQuest, dinoz => dinoz.player)
	quests: Relation<PlayerQuest[]>;

	@Column('text', {
		nullable: true
	})
	customText: string;

	@Column({
		nullable: false
	})
	name: string;

	@Column({
		nullable: false
	})
	eternalTwinId: string;

	@Column({
		nullable: false
	})
	money: number;

	@Column({
		nullable: false
	})
	quetzuBought: number;

	@Column({
		nullable: false
	})
	leader: boolean;

	@Column({
		nullable: false
	})
	engineer: boolean;

	@Column({
		nullable: false
	})
	cooker: boolean;

	@Column({
		nullable: false
	})
	shopKeeper: boolean;

	@Column({
		nullable: false
	})
	merchant: boolean;

	@Column({
		nullable: false
	})
	priest: boolean;

	@Column({
		nullable: false
	})
	teacher: boolean;

	@CreateDateColumn()
	createdDate: Date;

	@UpdateDateColumn()
	updatedDate: Date;

	constructor(id: number) {
		this.id = id;
	}
}
