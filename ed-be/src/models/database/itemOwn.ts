import {
	Table,
	Model,
	PrimaryKey,
	AllowNull,
	Column,
	BelongsTo,
	ForeignKey,
	Max
} from 'sequelize-typescript';
import { Player } from './player.js';

type PlayerType = Player;

@Table({ tableName: 'tb_item_own', timestamps: false })
export class ItemOwn extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	id!: number;

	@ForeignKey(() => Player)
	@Column
	playerId!: number;

	@BelongsTo(() => Player, 'playerId')
	player!: PlayerType;

	@Max(20)
	@AllowNull(false)
	@Column
	itemId!: number;

	@AllowNull(false)
	@Column
	quantity!: number;
}
