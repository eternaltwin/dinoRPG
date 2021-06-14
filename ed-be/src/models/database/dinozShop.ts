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
import { DinozRace } from './dinozRace.js';
import { Player } from './player.js';

type DinozRaceType = DinozRace;
type PlayerType = Player;

@Table({ tableName: 'tb_dinoz_shop', timestamps: false })
export class DinozShop extends Model {
	@PrimaryKey
	@AllowNull(false)
	@AutoIncrement
	@Column
	id!: number;

	@ForeignKey(() => Player)
	@Column
	playerId!: number;

	@BelongsTo(() => Player, 'playerId')
	player!: PlayerType;

	@ForeignKey(() => DinozRace)
	@Column
	raceId!: number;

	@BelongsTo(() => DinozRace, 'raceId')
	race!: DinozRaceType;

	@AllowNull(false)
	@Column
	display!: string;
}
