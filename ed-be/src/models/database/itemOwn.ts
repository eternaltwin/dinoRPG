import {
	Table,
	Model,
	PrimaryKey,
	AllowNull,
	Column,
	BelongsTo,
	ForeignKey,
	AutoIncrement
} from 'sequelize-typescript';
import { Player } from './player.js';

type PlayerType = Player;

@Table({ tableName: 'tb_item_own', timestamps: false })
export class ItemOwn extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@ForeignKey(() => Player)
	@Column
	playerId!: number;

	@BelongsTo(() => Player, { onDelete: 'CASCADE' })
	player!: PlayerType;

	@AllowNull(false)
	@Column
	itemId!: number;

	@AllowNull(false)
	@Column
	quantity!: number;
}
