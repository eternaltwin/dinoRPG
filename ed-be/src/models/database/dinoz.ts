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
	UpdatedAt,
} from 'sequelize-typescript';
import { DinozRace } from './dinozRace.js';
import { Element } from './element.js';
import { Level } from './level.js';
import { Mission } from './mission.js';
import { Place } from './place.js';
import { Player } from './player.js';
import { Skill } from './skill.js';
import { Status } from './status.js';
import { AssDinozObject } from './assDinozObject.js';
import { AssDinozSkill } from './assDinozSkill.js';
import { AssDinozStatus } from './assDinozStatus.js';

@Table({ tableName: 'tb_dinoz', timestamps: true })
export class Dinoz extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	dinozId!: number;

	@HasMany(() => AssDinozObject, 'dinozId')
	assDinozObject!: Array<AssDinozObject>;

	@BelongsToMany(() => Skill, () => AssDinozSkill)
	skill!: Array<Skill>;

	@BelongsToMany(() => Status, () => AssDinozStatus)
	status!: Array<Status>;

	@Column
	following!: number;

	@AllowNull(false)
	@Column
	name!: string;

	@AllowNull(false)
	@Column
	isFrozen!: boolean;

	@ForeignKey(() => DinozRace)
	@AllowNull(false)
	@Column
	raceId!: number;

	@BelongsTo(() => DinozRace, 'raceId')
	race!: DinozRace;

	@ForeignKey(() => Level)
	@AllowNull(false)
	@Column
	levelId!: number;

	@BelongsTo(() => Level, 'levelId')
	level!: Level;

	@ForeignKey(() => Mission)
	@Column
	missionId!: number;

	@BelongsTo(() => Mission, 'missionId')
	mission!: Mission;

	@ForeignKey(() => Element)
	@Column
	nextUpElementId!: number;

	@BelongsTo(() => Element, 'nextUpElementId')
	nextUp!: Element;

	@ForeignKey(() => Element)
	@Column
	nextUpAltElementId!: number;

	@BelongsTo(() => Element, 'nextUpAltElementId')
	nextUpAlt!: Element;

	@ForeignKey(() => Player)
	@AllowNull(false)
	@Column
	playerId!: number;

	@BelongsTo(() => Player, 'playerId')
	player!: Player;

	@ForeignKey(() => Place)
	@AllowNull(false)
	@Column
	placeId!: number;

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
