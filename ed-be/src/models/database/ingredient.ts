import {
	AllowNull,
	BelongsTo,
	Column,
	ForeignKey,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';
import { IngredientGridType } from './ingredientGridType';

@Table({ tableName: 'tb_ingredient', timestamps: false })
export class Ingredient extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	ingredientId!: number;

	@AllowNull(false)
	@Column
	name!: string;

	@ForeignKey(() => IngredientGridType)
	@AllowNull(false)
	@Column
	ingredientGridTypeId!: number;

	@BelongsTo(() => IngredientGridType, 'ingredientGridTypeId')
	ingredientGridType!: IngredientGridType;
}
