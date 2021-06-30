import {
	Table,
	Model,
	Column,
	AllowNull,
	PrimaryKey,
	HasMany,
} from 'sequelize-typescript';
import { AssDinozObject } from './assDinozObject.js';
import { AssPlayerObject } from './assPlayerObject.js';

@Table({ tableName: 'tb_object', timestamps: false })
export class Objet extends Model {
	@AllowNull(false)
	@PrimaryKey
	@Column
	objectId!: number;

	@HasMany(() => AssDinozObject, 'objectId')
	assDinozObject!: Array<AssDinozObject>;

	@HasMany(() => AssPlayerObject, 'objectId')
	assPlayerObject!: Array<AssPlayerObject>;

	@AllowNull(false)
	@Column
	name!: string;

	@AllowNull(false)
	@Column
	canBeUsedNow!: boolean;

	@AllowNull(false)
	@Column
	canBeEquiped!: boolean;

	@AllowNull(false)
	@Column
	price!: number;

	@Column
	maxQuantity!: number;
}
