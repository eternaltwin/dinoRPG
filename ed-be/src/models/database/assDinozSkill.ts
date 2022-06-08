import {
	Table,
	Model,
	ForeignKey,
	Column,
	PrimaryKey,
	AutoIncrement,
	AllowNull,
	BelongsTo,
	Default
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

type DinozType = Dinoz;

@Table({ tableName: 'tb_ass_dinoz_skill', timestamps: false })
export class AssDinozSkill extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@ForeignKey(() => Dinoz)
	@Column
	dinozId!: number;

	@BelongsTo(() => Dinoz, { onDelete: 'CASCADE' })
	dinoz!: DinozType;

	@AllowNull(false)
	@Column
	skillId!: number;

	@Default(true)
	@Column
	state!: boolean;
}
