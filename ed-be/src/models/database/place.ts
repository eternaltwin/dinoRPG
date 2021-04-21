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
import { Dinoz } from './dinoz';
import { IngredientGrid } from './ingredientGrid';
import { Map } from './map';
import { PlaceAccess } from './placeAccess';

@Table({ tableName: 'tb_place', timestamps: false })
export class Place extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	placeId!: bigint;

	@AllowNull(false)
	@Column
	name!: string;

	@HasMany(() => PlaceAccess)
	placeAccess!: Array<PlaceAccess>;

	@ForeignKey(() => Map)
	@Column
	mapId!: bigint;

	@BelongsTo(() => Map, 'mapId')
	map!: Map;

	@HasMany(() => IngredientGrid, 'ingredientGridId')
	ingredientGrid!: Array<IngredientGrid>;

	@HasMany(() => Dinoz, 'dinozId')
	dinoz!: Array<Dinoz>;
}
