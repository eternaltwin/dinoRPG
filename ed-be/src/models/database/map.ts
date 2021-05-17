import {
	AllowNull,
	Column,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { Place } from './place.js';

@Table({ tableName: 'tb_map', timestamps: false })
export class Map extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	mapId!: number;

	@HasMany(() => Place, 'mapId')
	place!: Array<Place>;

	@AllowNull(false)
	@Column
	name!: string;
}
