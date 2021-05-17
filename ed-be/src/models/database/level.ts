import {
	AllowNull,
	Column,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

@Table({ tableName: 'tb_level', timestamps: false })
export class Level extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	levelId!: number;

	@HasMany(() => Dinoz, 'levelId')
	dinoz!: Array<Dinoz>;

	@AllowNull(false)
	@Column
	level!: number;

	@AllowNull(false)
	@Column
	experience!: number;
}
