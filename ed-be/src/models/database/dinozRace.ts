import {
	Table,
	Model,
	PrimaryKey,
	AllowNull,
	Column,
	HasMany,
	ForeignKey,
	BelongsTo,
	CreatedAt,
	UpdatedAt,
	HasOne,
} from 'sequelize-typescript';
import { Dinoz } from './dinoz';
import { DinozShop } from './dinozShop';
import { Skill } from './skill';

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

	@AllowNull(false)
	@Column
	nbrFireCase!: number;

	@AllowNull(false)
	@Column
	nbrWoodCase!: number;

	@AllowNull(false)
	@Column
	nbrWaterCase!: number;

	@AllowNull(false)
	@Column
	nbrLightCase!: number;

	@AllowNull(false)
	@Column
	nbrAirCase!: number;

	@Column
	price!: number;

	@Column
	swfLetter!: string;

	@ForeignKey(() => Skill)
	@Column
	skillId!: number;

	@BelongsTo(() => Skill, 'skillId')
	skill!: Skill;
}
