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
import { IngredientGridType } from './ingredientGridType.js';
import { Place } from './place.js';
import { Player } from './player.js';

type IngredientGridTypeType = IngredientGridType;
type PlaceType = Place;
type PlayerType = Player;

@Table({ tableName: 'tb_ingredient_grid', timestamps: false })
export class IngredientGrid extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	gridId!: number;

	@ForeignKey(() => Player)
	@AllowNull(false)
	@Column
	playerId!: number;

	@BelongsTo(() => Player, 'playerId')
	player!: PlayerType;

	/*@AllowNull(false)
  @Column
  etat!: Array<number>

  @AllowNull(false)
  @Column
  type!: Array<number>*/

	@ForeignKey(() => IngredientGridType)
	@AllowNull(false)
	@Column
	ingredientGridTypeId!: number;

	@BelongsTo(() => IngredientGridType, 'ingredientGridTypeId')
	ingredientGridType!: IngredientGridTypeType;

	@ForeignKey(() => Place)
	@AllowNull(false)
	@Column
	placeId!: number;

	@BelongsTo(() => Place, 'placeId')
	place!: PlaceType;
}
