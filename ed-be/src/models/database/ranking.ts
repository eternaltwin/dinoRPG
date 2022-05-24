import { AutoIncrement, BelongsTo, Column, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Player } from './player.js';

type PlayerType = Player;

@Table({ tableName: 'tb_ranking', timestamps: false })
export class Ranking extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@ForeignKey(() => Player)
	@Column
	playerId!: number;

	@BelongsTo(() => Player, { onDelete: 'CASCADE' })
	player!: PlayerType;

	@Column
	sumPosition!: number;

	@Default(0)
	@Column
	sumPoints!: number;

	@Default(0)
	@Column
	sumPointsDisplayed!: number;

	@Column
	averagePosition!: number;

	@Default(0)
	@Column
	averagePoints!: number;

	@Default(0)
	@Column
	averagePointsDisplayed!: number;

	@Default(0)
	@Column
	dinozCount!: number;

	@Default(0)
	@Column
	dinozCountDisplayed!: number;
}
