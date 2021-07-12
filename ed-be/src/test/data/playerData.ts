import { Player } from '../../models';
import { reward } from '../../constants/index.js';
import { player } from '../utils/constants';

export const BasicPlayer = {
	playerId: player.id_1,
} as Player;

export const PlayerWithRewards = {
	playerId: player.id_1,
	quetzuBought: 0,
	reward: [
		{
			rewardId: 13214,
			name: reward.tropheeHippoclamp,
		},
		{
			rewardId: 9845,
			name: reward.tropheePteroz,
		},
		{
			rewardId: 79456,
			name: reward.tropheeRocky,
		},
		{
			rewardId: 7974,
			name: reward.tropheeQuetzu,
		},
	],
} as Player;
