import {
	Table,
	Model,
	Column,
	AllowNull,
	PrimaryKey,
	HasMany,
} from 'sequelize-typescript';
import { AssDinozObject } from './assDinozObject';

@Table({ tableName: 'tb_object', timestamps: false })
export class Objet extends Model {
	@AllowNull(false)
	@PrimaryKey
	@Column
	objectId!: bigint;

	@HasMany(() => AssDinozObject)
	assDinozObject!: Array<AssDinozObject>;

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
}
