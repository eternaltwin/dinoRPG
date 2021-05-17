import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { EpicReward } from './epicReward.js';
import { Player } from './player.js';

@Table({ tableName: 'tb_ass_player_reward', timestamps: false })
export class AssPlayerReward extends Model {
	@ForeignKey(() => Player)
	@Column
	playerId!: number;

	@ForeignKey(() => EpicReward)
	@Column
	rewardId!: number;
}
