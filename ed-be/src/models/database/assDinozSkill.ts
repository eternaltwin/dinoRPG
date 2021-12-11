import {
	Table,
	Model,
	ForeignKey,
	Column,
	AllowNull,
	PrimaryKey,
	AutoIncrement
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

@Table({ tableName: 'tb_ass_dinoz_skill', timestamps: false })
export class AssDinozSkill extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	id!: number;

	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: number;

	@AllowNull(false)
	@Column
	skillId!: number;

	@Column
	state!: boolean;
}
