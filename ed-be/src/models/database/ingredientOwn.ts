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

@Table({ tableName: 'tb_ingredient_own', timestamps: false })
export class IngredientOwn extends Model {
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
	ingredientId!: number;

	@AllowNull(false)
	@Column
	quantity!: number;
}
