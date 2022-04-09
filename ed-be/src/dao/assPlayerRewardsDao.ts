import { AssPlayerReward, AddMultipleRewardsEdit } from '../models/index.js';

const addRewardToPlayer = (
	playerId: number,
	rewardId: number
): Promise<AssPlayerReward> => {
	return AssPlayerReward.create({
		playerId: playerId,
		rewardId: rewardId
	});
};

const addMultipleRewardToPlayer = (
	rewards: Array<AddMultipleRewardsEdit>
): Promise<Array<AssPlayerReward>> => {
	return AssPlayerReward.bulkCreate(rewards);
};

const removeRewardToPlayer = (
	playerId: number,
	rewardId: number
): Promise<number> => {
	return AssPlayerReward.destroy({
		where: {
			playerId: playerId,
			rewardId: rewardId
		}
	});
};

export { addRewardToPlayer, addMultipleRewardToPlayer, removeRewardToPlayer };
