import { Table, Model, ForeignKey, Column } from 'sequelize-typescript';
import { Dinoz } from './dinoz';
import { Skill } from './skill';

@Table({ tableName: 'tb_ass_dinoz_skill', timestamps: false })
export class AssDinozSkill extends Model {
	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: bigint;

	@ForeignKey(() => Skill)
	@Column
	skillId!: bigint;
}
