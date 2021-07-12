import {
	Table,
	Model,
	PrimaryKey,
	AllowNull,
	Column,
	BelongsTo,
	ForeignKey,
} from 'sequelize-typescript';
import { Item } from './item.js';
import { Player } from './player.js';

type PlayerType = Player;

@Table({ tableName: 'tb_inventory', timestamps: false })
export class Inventory extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	id!: number;

	@ForeignKey(() => Player)
	@Column
	playerId!: number;

	@BelongsTo(() => Player, 'playerId')
	player!: PlayerType;

	@ForeignKey(() => Item)
	@Column
	itemId!: number;

	@BelongsTo(() => Item, 'itemId')
	item!: Item;

	@AllowNull(false)
	@Column
	quantity!: number;
}
