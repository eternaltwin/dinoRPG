import { Player } from '../../models';
import { rewardList } from '../../constants/index.js';
import { player } from '../utils/constants';

export const BasicPlayer = {
	playerId: player.id_1
} as Player;

export const PlayerWithRewards = ({
	playerId: player.id_1,
	quetzuBought: 0,
	reward: [
		{
			rewardId: 13214,
			name: rewardList.TROPHEE_HIPPOCLAMP
		},
		{
			rewardId: 9845,
			name: rewardList.TROPHEE_PTEROZ
		},
		{
			rewardId: 79456,
			name: rewardList.TROPHEE_ROCKY
		},
		{
			rewardId: 7974,
			name: rewardList.TROPHEE_QUETZU
		}
	]
} as unknown) as Player;
