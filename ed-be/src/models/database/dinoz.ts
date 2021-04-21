import {
	AllowNull,
	AutoIncrement,
	BelongsTo,
	BelongsToMany,
	Column,
	CreatedAt,
	ForeignKey,
	HasMany,
	Model,
	PrimaryKey,
	Table,
	Unique,
	UpdatedAt,
} from 'sequelize-typescript';
import { DinozRace } from './dinozRace';
import { Element } from './element';
import { Level } from './level';
import { Mission } from './mission';
import { Place } from './place';
import { Player } from './player';
import { Skill } from './skill';
import { Status } from './status';
import { AssDinozObject } from './assDinozObject';
import { AssDinozSkill } from './assDinozSkill';
import { AssDinozStatus } from './assDinozStatus';

@Table({ tableName: 'tb_dinoz', timestamps: true })
export class Dinoz extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	dinozId!: bigint;

	@HasMany(() => AssDinozObject)
	assDinozObject!: Array<AssDinozObject>;

	@BelongsToMany(() => Skill, () => AssDinozSkill)
	skill!: Array<Skill>;

	@BelongsToMany(() => Status, () => AssDinozStatus)
	status!: Array<Status>;

	@Column
	following!: bigint;

	@AllowNull(false)
	@Column
	name!: string;

	@AllowNull(false)
	@Column
	isFrozen!: boolean;

	@ForeignKey(() => DinozRace)
	@AllowNull(false)
	@Column
	raceId!: bigint;

	@BelongsTo(() => DinozRace, 'raceId')
	race!: DinozRace;

	@ForeignKey(() => Level)
	@AllowNull(false)
	@Column
	levelId!: bigint;

	@BelongsTo(() => Level, 'levelId')
	level!: Level;

	@ForeignKey(() => Mission)
	@Column
	missionId!: bigint;

	@BelongsTo(() => Mission, 'missionId')
	mission!: Mission;

	@ForeignKey(() => Element)
	@Column
	nextUpElementId!: bigint;

	@BelongsTo(() => Element, 'nextUpElementId')
	nextUp!: Element;

	@ForeignKey(() => Element)
	@Column
	nextUpAltElementId!: bigint;

	@BelongsTo(() => Element, 'nextUpAltElementId')
	nextUpAlt!: Element;

	@ForeignKey(() => Player)
	@AllowNull(false)
	@Column
	playerId!: bigint;

	@BelongsTo(() => Player, 'playerId')
	player!: Player;

	@ForeignKey(() => Place)
	@AllowNull(false)
	@Column
	placeId!: bigint;

	@BelongsTo(() => Place, 'placeId')
	place!: Place;

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
