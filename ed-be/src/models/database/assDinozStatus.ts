import {
	AllowNull,
	AutoIncrement,
	Column,
	ForeignKey,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

@Table({ tableName: 'tb_ass_dinoz_status', timestamps: false })
export class AssDinozStatus extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	id!: number;

	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: number;

	@Column
	statusId!: number;
}
