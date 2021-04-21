import {
	AllowNull,
	BelongsTo,
	Column,
	ForeignKey,
	Model,
	PrimaryKey,
	Table,
	Unique,
} from 'sequelize-typescript';
import { Place } from './place';

@Table({ tableName: 'tb_place_access', timestamps: false })
export class PlaceAccess extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	id!: bigint;

	@ForeignKey(() => Place)
	@AllowNull(false)
	@Column
	placeId!: bigint;

	@BelongsTo(() => Place, 'placeId')
	place!: Place;

	@AllowNull(false)
	@Column
	canGoTo!: bigint;
}
