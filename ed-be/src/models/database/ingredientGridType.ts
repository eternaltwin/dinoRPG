import {
	AllowNull,
	Column,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { IngredientGrid } from './ingredientGrid';
import { Ingredient } from './ingredient';

@Table({ tableName: 'tb_ingredient_grid_type', timestamps: false })
export class IngredientGridType extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	ingredientGridTypeId!: bigint;

	@HasMany(() => IngredientGrid, 'ingredientGridId')
	ingredientGrid!: Array<IngredientGrid>;

	@HasMany(() => Ingredient, 'ingredientId')
	ingredient!: Array<Ingredient>;

	@AllowNull(false)
	@Column
	length!: number;

	@AllowNull(false)
	@Column
	width!: number;
}
