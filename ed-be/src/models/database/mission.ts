import {
	AllowNull,
	Column,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

@Table({ tableName: 'tb_mission', timestamps: false })
export class Mission extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	missionId!: number;

	@HasMany(() => Dinoz)
	dinoz!: Array<Dinoz>;

	@AllowNull(false)
	@Column
	name!: string;
}
