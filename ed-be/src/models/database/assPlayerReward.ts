import {
	AllowNull,
	AutoIncrement,
	Column,
	ForeignKey,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript';
import { Player } from './player.js';

@Table({ tableName: 'tb_ass_player_reward', timestamps: false })
export class AssPlayerReward extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column
	id!: number;

	@ForeignKey(() => Player)
	@Column
	playerId!: number;

	@AllowNull(false)
	@Column
	rewardId!: number;
}
