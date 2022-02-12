import {
	AllowNull,
	AutoIncrement,
	BelongsTo,
	Column,
	ForeignKey,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

type DinozType = Dinoz;

@Table({ tableName: 'tb_ass_dinoz_status', timestamps: false })
export class AssDinozStatus extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: number;

	@BelongsTo(() => Dinoz, { onDelete: 'CASCADE' })
	dinoz!: DinozType;

	@AllowNull(false)
	@Column
	statusId!: number;
}
