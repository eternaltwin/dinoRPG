import {
	Table,
	Model,
	Column,
	AllowNull,
	PrimaryKey,
	AutoIncrement,
	ForeignKey,
	BelongsTo
} from 'sequelize-typescript';
import { Player } from './player.js';

type PlayerType = Player;

@Table({ tableName: 'tb_dinoz_shop', timestamps: false })
export class DinozShop extends Model {
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
	raceId!: number;

	@AllowNull(false)
	@Column
	display!: string;
}
