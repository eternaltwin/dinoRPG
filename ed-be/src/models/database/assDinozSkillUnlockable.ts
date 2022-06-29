import {
	Table,
	Model,
	PrimaryKey,
	AutoIncrement,
	Column,
	ForeignKey,
	BelongsTo,
	AllowNull
} from 'sequelize-typescript';
import { Dinoz } from './dinoz.js';

type DinozType = Dinoz;

@Table({ tableName: 'tb_ass_dinoz_skill_unlockable', timestamps: false })
export class AssDinozSkillUnlockable extends Model {
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
}
