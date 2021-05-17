import {
	AllowNull,
	Column,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

@Table({ tableName: 'tb_element', timestamps: false })
export class Element extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	elementId!: number;

	@HasMany(() => Dinoz, 'nextUpElementId')
	dinozNextUp!: Array<Dinoz>;

	@HasMany(() => Dinoz, 'nextUpAltElementId')
	dinozNextUpAlt!: Array<Dinoz>;

	@AllowNull(false)
	@Column
	name!: string;
}
