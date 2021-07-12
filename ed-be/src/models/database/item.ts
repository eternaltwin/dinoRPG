import {
	Table,
	Model,
	Column,
	AllowNull,
	PrimaryKey,
	HasMany,
} from 'sequelize-typescript';
import { AssDinozItem } from './assDinozItem.js';
import { Inventory } from './inventory.js';

@Table({ tableName: 'tb_item', timestamps: false })
export class Item extends Model {
	@AllowNull(false)
	@PrimaryKey
	@Column
	itemId!: number;

	@HasMany(() => AssDinozItem, 'itemId')
	assDinozItem!: Array<AssDinozItem>;

	@HasMany(() => Inventory, 'itemId')
	inventory!: Array<Inventory>;

	@AllowNull(false)
	@Column
	name!: string;
}
