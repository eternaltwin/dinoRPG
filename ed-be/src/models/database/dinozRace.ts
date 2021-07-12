import {
	Table,
	Model,
	PrimaryKey,
	AllowNull,
	Column,
	HasMany,
	ForeignKey,
	BelongsTo,
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';
import { DinozShop } from './dinozShop.js';
import { Skill } from './skill.js';

@Table({ tableName: 'tb_dinoz_race', timestamps: false })
export class DinozRace extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	raceId!: number;

	@HasMany(() => Dinoz, 'raceId')
	dinoz!: Array<Dinoz>;

	@HasMany(() => DinozShop, 'raceId')
	dinozShop!: Array<DinozShop>;

	@AllowNull(false)
	@Column
	name!: string;

	@ForeignKey(() => Skill)
	@Column
	skillId!: number;

	@BelongsTo(() => Skill, 'skillId')
	skill!: Skill;

	nbrFireCase!: number;

	nbrWoodCase!: number;

	nbrWaterCase!: number;

	nbrLightCase!: number;

	nbrAirCase!: number;

	price!: number;

	swfLetter!: string;
}
