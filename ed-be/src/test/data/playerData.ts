import { Player } from '../../models';
import { reward } from '../../utils/constants';
import { player } from '../utils/constants';

export const BasicPlayer = {
	playerId: BigInt(player.id_1),
} as Player;

export const PlayerWithRewards = {
	playerId: BigInt(player.id_1),
	quetzuBought: 0,
	reward: [
		{
			rewardId: BigInt(13214),
			name: reward.tropheeHippoclamp,
		},
		{
			rewardId: BigInt(9845),
			name: reward.tropheePteroz,
		},
		{
			rewardId: BigInt(79456),
			name: reward.tropheeRocky,
		},
		{
			rewardId: BigInt(7974),
			name: reward.tropheeQuetzu,
		},
	],
} as Player;
