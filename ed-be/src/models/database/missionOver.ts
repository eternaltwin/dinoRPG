import {
	AllowNull,
	AutoIncrement,
	BelongsTo,
	Column,
	ForeignKey,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

type DinozType = Dinoz;

@Table({ tableName: 'tb_mission_over', timestamps: false })
export class MissionOver extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: number;

	@BelongsTo(() => Dinoz, 'dinozId')
	dinoz!: DinozType;

	@AllowNull(false)
	@Column
	missionId!: number;
}
