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
	ingredientId!: bigint;

	@AllowNull(false)
	@Column
	name!: string;

	@ForeignKey(() => IngredientGridType)
	@AllowNull(false)
	@Column
	ingredientGridTypeId!: bigint;

	@BelongsTo(() => IngredientGridType, 'ingredientGridTypeId')
	ingredientGridType!: IngredientGridType;
}
