import {
	AllowNull,
	AutoIncrement,
	BelongsTo,
	Column,
	ForeignKey,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { IngredientGridType } from './ingredientGridType';
import { Place } from './place';
import { Player } from './player';

@Table({ tableName: 'tb_ingredient_grid', timestamps: false })
export class IngredientGrid extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	gridId!: bigint;

	@ForeignKey(() => Player)
	@AllowNull(false)
	@Column
	playerId!: bigint;

	@BelongsTo(() => Player, 'playerId')
	player!: Player;

	/*@AllowNull(false)
  @Column
  etat!: Array<number>

  @AllowNull(false)
  @Column
  type!: Array<number>*/

	@ForeignKey(() => IngredientGridType)
	@AllowNull(false)
	@Column
	ingredientGridTypeId!: bigint;

	@BelongsTo(() => IngredientGridType, 'ingredientGridTypeId')
	ingredientGridType!: IngredientGridType;

	@ForeignKey(() => Place)
	@AllowNull(false)
	@Column
	placeId!: bigint;

	@BelongsTo(() => Place, 'placeId')
	place!: Place;
}
