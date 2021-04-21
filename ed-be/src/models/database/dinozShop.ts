import {
	Table,
	Model,
	Column,
	AllowNull,
	PrimaryKey,
	AutoIncrement,
	ForeignKey,
	BelongsTo,
} from 'sequelize-typescript';
import { DinozRace } from './dinozRace';
import { Player } from './player';

@Table({ tableName: 'tb_dinoz_shop', timestamps: false })
export class DinozShop extends Model {
	@PrimaryKey
	@AllowNull(false)
	@AutoIncrement
	@Column
	id!: bigint;

	@ForeignKey(() => Player)
	@Column
	playerId!: bigint;

	@BelongsTo(() => Player, 'playerId')
	player!: Player;

	@ForeignKey(() => DinozRace)
	@Column
	raceId!: bigint;

	@BelongsTo(() => DinozRace, 'raceId')
	race!: DinozRace;

	@AllowNull(false)
	@Column
	display!: string;
}
