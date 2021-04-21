import {
	AllowNull,
	BelongsToMany,
	Column,
	HasOne,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { AssDinozSkill } from './assDinozSkill';
import { Dinoz } from './dinoz';
import { DinozRace } from './dinozRace';

@Table({ tableName: 'tb_skill', timestamps: false })
export class Skill extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	skillId!: bigint;

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
