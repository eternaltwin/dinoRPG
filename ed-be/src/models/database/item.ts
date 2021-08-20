import {
	Table,
	Model,
	Column,
	AllowNull,
	PrimaryKey,
	HasMany
} from 'sequelize-typescript';
import { AssDinozItem } from './assDinozItem.js';
import { ItemOwn } from './itemOwn.js';

@Table({ tableName: 'tb_item', timestamps: false })
export class Item extends Model {
	@AllowNull(false)
	@PrimaryKey
	@Column
	itemId!: number;

	@HasMany(() => AssDinozItem, 'itemId')
	assDinozItem!: Array<AssDinozItem>;

	@HasMany(() => ItemOwn, 'itemId')
	itemOwn!: Array<ItemOwn>;

	@AllowNull(false)
	@Column
	name!: string;
}
