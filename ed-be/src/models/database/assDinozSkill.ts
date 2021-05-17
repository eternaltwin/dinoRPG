import { Table, Model, ForeignKey, Column } from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';
import { Skill } from './skill.js';

@Table({ tableName: 'tb_ass_dinoz_skill', timestamps: false })
export class AssDinozSkill extends Model {
	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: number;

	@ForeignKey(() => Skill)
	@Column
	skillId!: number;
}
