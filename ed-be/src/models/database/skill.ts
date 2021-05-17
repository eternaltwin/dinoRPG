import {
	AllowNull,
	BelongsToMany,
	Column,
	HasOne,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { AssDinozSkill } from './assDinozSkill.js';
import { Dinoz } from './dinoz.js';
import { DinozRace } from './dinozRace.js';

@Table({ tableName: 'tb_skill', timestamps: false })
export class Skill extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	skillId!: number;

	@BelongsToMany(() => Dinoz, () => AssDinozSkill)
	dinoz!: Array<Dinoz>;

	@HasOne(() => DinozRace, 'skillId')
	race!: DinozRace;

	@AllowNull(false)
	@Column
	name!: string;

	@AllowNull(false)
	@Column
	type!: string;
}
