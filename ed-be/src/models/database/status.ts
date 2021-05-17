import {
	AllowNull,
	BelongsToMany,
	Column,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';
import { AssDinozStatus } from './assDinozStatus.js';
import { Dinoz } from './dinoz.js';

@Table({ tableName: 'tb_status', timestamps: false })
export class Status extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	statusId!: number;

	@BelongsToMany(() => Dinoz, () => AssDinozStatus)
	dinoz!: Array<Dinoz>;

	@AllowNull(false)
	@Column
	name!: string;
}
