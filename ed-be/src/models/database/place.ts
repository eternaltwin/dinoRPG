import {
	AllowNull,
	Column,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';
import { IngredientGrid } from './ingredientGrid.js';

@Table({ tableName: 'tb_place', timestamps: false })
export class Place extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	placeId!: number;

	@AllowNull(false)
	@Column
	name!: string;

	@HasMany(() => IngredientGrid, 'ingredientGridId')
	ingredientGrid!: Array<IngredientGrid>;

	@HasMany(() => Dinoz, 'placeId')
	dinoz!: Array<Dinoz>;
}
