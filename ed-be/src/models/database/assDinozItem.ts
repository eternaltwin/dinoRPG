import {
	Table,
	Model,
	Column,
	PrimaryKey,
	AutoIncrement,
	AllowNull,
	BelongsTo,
	ForeignKey,
	Max
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

@Table({ tableName: 'tb_ass_dinoz_item', timestamps: false })
export class AssDinozItem extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	id!: number;

	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: number;

	@BelongsTo(() => Dinoz, 'dinozId')
	dinoz!: Dinoz;

	@Max(20)
	@AllowNull(false)
	@Column
	itemId!: number;
}
