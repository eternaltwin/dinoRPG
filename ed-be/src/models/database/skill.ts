import {
	AllowNull,
	BelongsToMany,
	Column,
	HasOne,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript';
import { AssDinozSkill } from './assDinozSkill.js';
import { Dinoz } from './dinoz.js';
import { DinozRace } from './dinozRace.js';

type DinozType = Dinoz;
type DinozRaceType = DinozRace;

@Table({ tableName: 'tb_skill', timestamps: false })
export class Skill extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	skillId!: number;

	@BelongsToMany(() => Dinoz, () => AssDinozSkill)
	dinoz!: Array<DinozType>;

	@HasOne(() => DinozRace, 'skillId')
	race!: DinozRaceType;

	@AllowNull(false)
	@Column
	name!: string;

	@AllowNull(false)
	@Column
	type!: string;
}
