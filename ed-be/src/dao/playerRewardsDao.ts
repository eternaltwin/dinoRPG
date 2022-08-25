import { AppDataSource } from '../data-source.js';
import { PlayerReward } from '../entity/index.js';
import { DeleteResult } from 'typeorm';

const rewardRepository = AppDataSource.getRepository(PlayerReward);

//TODO
const addRewardToPlayer = (playerId: number, rewardId: number): Promise<PlayerReward> => {
	return rewardRepository.save({
		rewardId: rewardId,
		playerId: playerId
	});
};

//TODO
const addMultipleRewardToPlayer = (rewards: Array<PlayerReward>): Promise<Array<PlayerReward>> => {
	return rewardRepository.save(rewards);
};

const removeRewardToPlayer = (playerId: number, rewardId: number): Promise<DeleteResult> => {
	return rewardRepository
		.createQueryBuilder()
		.delete()
		.from(PlayerReward)
		.where('rewardId = :rId AND player.id = :pId', { rId: rewardId, pId: playerId })
		.execute();
};

export { addRewardToPlayer, addMultipleRewardToPlayer, removeRewardToPlayer };
