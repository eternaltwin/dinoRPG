import {
	AllowNull,
	AutoIncrement,
	BelongsTo,
	Column,
	ForeignKey,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript';
import { Player } from './player.js';

type PlayerType = Player;

@Table({ tableName: 'tb_quest', timestamps: false })
export class Quest extends Model {
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
	questId!: number;

	@AllowNull(false)
	@Column
	progression!: number;
}
