import {
	Table,
	Model,
	Column,
	PrimaryKey,
	AutoIncrement,
	AllowNull,
	BelongsTo,
	ForeignKey,
} from 'sequelize-typescript';
import { Dinoz } from './dinoz';
import { Objet } from './objet';

@Table({ tableName: 'tb_ass_dinoz_object', timestamps: false })
export class AssDinozObject extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	id!: bigint;

	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: bigint;

	@BelongsTo(() => Dinoz, 'dinozId')
	dinoz!: Dinoz;

	@ForeignKey(() => Objet)
	@Column
	objectId!: bigint;

	@BelongsTo(() => Objet, 'objectId')
	object!: Object;
}
