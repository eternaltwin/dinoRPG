import {
	Table,
	Model,
	PrimaryKey,
	AllowNull,
	Column,
	BelongsTo,
	ForeignKey,
} from 'sequelize-typescript';
import { Objet } from './objet.js';
import { Player } from './player.js';

type PlayerType = Player;

@Table({ tableName: 'tb_ass_player_object', timestamps: false })
export class AssPlayerObject extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	id!: number;

	@ForeignKey(() => Player)
	@Column
	playerId!: number;

	@BelongsTo(() => Player, 'playerId')
	player!: PlayerType;

	@ForeignKey(() => Objet)
	@Column
	objectId!: number;

	@BelongsTo(() => Objet, 'objectId')
	object!: Objet;

	@AllowNull(false)
	@Column
	quantity!: number;
}
