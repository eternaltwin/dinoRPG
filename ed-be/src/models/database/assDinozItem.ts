import {
	Table,
	Model,
	Column,
	PrimaryKey,
	AutoIncrement,
	AllowNull,
	BelongsTo,
	ForeignKey
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

@Table({ tableName: 'tb_ass_dinoz_item', timestamps: false })
export class AssDinozItem extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: number;

	@BelongsTo(() => Dinoz, { onDelete: 'CASCADE' })
	dinoz!: Dinoz;

	@AllowNull(false)
	@Column
	itemId!: number;
}
