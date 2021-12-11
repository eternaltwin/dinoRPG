import {
	AllowNull,
	AutoIncrement,
	BelongsTo,
	Column,
	CreatedAt,
	ForeignKey,
	HasMany,
	Max,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt
} from 'sequelize-typescript';

import { Player } from './player.js';
import { AssDinozItem } from './assDinozItem.js';
import { AssDinozSkill } from './assDinozSkill.js';
import { AssDinozStatus } from './assDinozStatus.js';

@Table({ tableName: 'tb_dinoz', timestamps: true })
export class Dinoz extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	dinozId!: number;

	@HasMany(() => AssDinozItem, 'dinozId')
	item!: Array<AssDinozItem>;

	@HasMany(() => AssDinozSkill, 'dinozId')
	skill!: Array<AssDinozSkill>;

	@HasMany(() => AssDinozStatus, 'dinozId')
	status!: Array<AssDinozStatus>;

	@Column
	following!: number;

	@AllowNull(false)
	@Column
	name!: string;

	@AllowNull(false)
	@Column
	isFrozen!: boolean;

	@Max(21)
	@AllowNull(false)
	@Column
	raceId!: number;

	@AllowNull(false)
	@Column
	level!: number;

	@Column
	missionId!: number;

	@Max(5)
	@Column
	nextUpElementId!: number;

	@Max(5)
	@Column
	nextUpAltElementId!: number;

	@ForeignKey(() => Player)
	@AllowNull(false)
	@Column
	playerId!: number;

	@BelongsTo(() => Player, 'playerId')
	player!: Player;

	@Max(50)
	@AllowNull(false)
	@Column
	placeId!: number;

	@AllowNull(false)
	@Column
	canChangeName!: boolean;

	@AllowNull(false)
	@Column
	display!: string;

	@AllowNull(false)
	@Column
	life!: number;

	@AllowNull(false)
	@Column
	maxLife!: number;

	@AllowNull(false)
	@Column
	experience!: number;

	@AllowNull(false)
	@Column
	canGather!: boolean;

	@AllowNull(false)
	@Column
	nbrUpFire!: number;

	@AllowNull(false)
	@Column
	nbrUpWood!: number;

	@AllowNull(false)
	@Column
	nbrUpWater!: number;

	@AllowNull(false)
	@Column
	nbrUpLight!: number;

	@AllowNull(false)
	@Column
	nbrUpAir!: number;

	@CreatedAt
	@Column
	createdAt!: Date;

	@UpdatedAt
	@Column
	updatedAt!: Date;
}
