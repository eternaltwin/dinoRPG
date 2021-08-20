import {
	AllowNull,
	BelongsToMany,
	Column,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt
} from 'sequelize-typescript';
import { AssPlayerReward } from './assPlayerReward.js';
import { Player } from './player.js';

@Table({ tableName: 'tb_epic_reward', timestamps: false })
export class EpicReward extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column
	rewardId!: number;

	@BelongsToMany(() => Player, () => AssPlayerReward)
	player!: Array<Player>;

	@AllowNull(false)
	@Column
	name!: string;
}
