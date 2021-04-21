import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { EpicReward } from './epicReward';
import { Player } from './player';

@Table({ tableName: 'tb_ass_player_reward', timestamps: false })
export class AssPlayerReward extends Model {
	@ForeignKey(() => Player)
	@Column
	playerId!: bigint;

	@ForeignKey(() => EpicReward)
	@Column
	rewardId!: bigint;
}
