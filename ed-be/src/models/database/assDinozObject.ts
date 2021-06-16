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
import { Dinoz } from './dinoz.js';
import { Objet } from './objet.js';

@Table({ tableName: 'tb_ass_dinoz_object', timestamps: false })
export class AssDinozObject extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	id!: number;

	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: number;

	@BelongsTo(() => Dinoz, 'dinozId')
	dinoz!: Dinoz;

	@ForeignKey(() => Objet)
	@Column
	objectId!: number;

	@BelongsTo(() => Objet, 'objectId')
	object!: Objet;
}
