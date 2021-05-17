import {
	AllowNull,
	Column,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { IngredientGrid } from './ingredientGrid.js';
import { Ingredient } from './ingredient.js';

@Table({ tableName: 'tb_ingredient_grid_type', timestamps: false })
export class IngredientGridType extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	ingredientGridTypeId!: number;

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
