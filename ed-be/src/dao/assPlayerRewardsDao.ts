import { AssPlayerReward } from '../models/index.js';

const addRewardToPlayer = (
	playerId: number,
	rewardId: number
): Promise<AssPlayerReward> => {
	return AssPlayerReward.create({
		playerId: playerId,
		rewardId: rewardId
	});
};

export { addRewardToPlayer };
