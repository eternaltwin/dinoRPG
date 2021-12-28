import {
	Table,
	Model,
	ForeignKey,
	Column,
	PrimaryKey,
	AutoIncrement,
	AllowNull
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

@Table({ tableName: 'tb_ass_dinoz_skill', timestamps: false })
export class AssDinozSkill extends Model {
	@PrimaryKey
	@AutoIncrement
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
