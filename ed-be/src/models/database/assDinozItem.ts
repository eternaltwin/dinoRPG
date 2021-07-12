import {
	Table,
	Model,
	Column,
	PrimaryKey,
	AutoIncrement,
	AllowNull,
	BelongsTo,
	ForeignKey,
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';
import { Item } from './item.js';

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

	@ForeignKey(() => Item)
	@Column
	itemId!: number;

	@BelongsTo(() => Item, 'itemId')
	item!: Item;
}
