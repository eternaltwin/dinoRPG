import {
	AllowNull,
	BelongsTo,
	Column,
	ForeignKey,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';
import { IngredientGrid } from './ingredientGrid.js';
import { Map } from './map.js';
import { PlaceAccess } from './placeAccess.js';

@Table({ tableName: 'tb_place', timestamps: false })
export class Place extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	placeId!: number;

	@AllowNull(false)
	@Column
	name!: string;

	@HasMany(() => PlaceAccess)
	placeAccess!: Array<PlaceAccess>;

	@ForeignKey(() => Map)
	@Column
	mapId!: number;

	@BelongsTo(() => Map, 'mapId')
	map!: Map;

	@HasMany(() => IngredientGrid, 'ingredientGridId')
	ingredientGrid!: Array<IngredientGrid>;

	@HasMany(() => Dinoz, 'dinozId')
	dinoz!: Array<Dinoz>;
}
