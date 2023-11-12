import { AppDataSource } from '../data-source.js';
import { PlayerReward } from '../entity/index.js';
import { DeleteResult } from 'typeorm';

const rewardRepository = AppDataSource.getRepository(PlayerReward);

//TODO
const addRewardToPlayer = (player: PlayerReward): Promise<PlayerReward> => {
	return rewardRepository.save(player);
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

const getPlayerRewards = (playerId: number): Promise<PlayerReward[]> => {
	return rewardRepository.find({
		where: {
			player: {
				id: playerId
			}
		},
		select: ['rewardId']
	});
}

export { addRewardToPlayer, addMultipleRewardToPlayer, removeRewardToPlayer, getPlayerRewards };
