import {
	Table,
	Model,
	Column,
	AllowNull,
	PrimaryKey,
	AutoIncrement,
	ForeignKey,
	BelongsTo,
	Max
} from 'sequelize-typescript';
import { Player } from './player.js';

type PlayerType = Player;

@Table({ tableName: 'tb_dinoz_shop', timestamps: false })
export class DinozShop extends Model {
	@PrimaryKey
	@AllowNull(false)
	@AutoIncrement
	@Column
	id!: number;

	@ForeignKey(() => Player)
	@Column
	playerId!: number;

	@BelongsTo(() => Player, 'playerId')
	player!: PlayerType;

	@Max(21)
	@AllowNull(false)
	@Column
	raceId!: number;

	@AllowNull(false)
	@Column
	display!: string;
}
