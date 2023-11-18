import { AppDataSource } from '../data-source.js';
import { PlayerReward } from '../entity/index.js';
import { DeleteResult } from 'typeorm';

const rewardRepository = AppDataSource.getRepository(PlayerReward);

//TODO
export async function addRewardToPlayer(player: PlayerReward): Promise<PlayerReward> {
	return rewardRepository.save(player);
}

//TODO
export async function addMultipleRewardToPlayer(rewards: Array<PlayerReward>): Promise<Array<PlayerReward>> {
	return rewardRepository.save(rewards);
}

export async function removeRewardToPlayer(playerId: number, rewardId: number): Promise<DeleteResult> {
	return rewardRepository
		.createQueryBuilder()
		.delete()
		.from(PlayerReward)
		.where('rewardId = :rId AND player.id = :pId', { rId: rewardId, pId: playerId })
		.execute();
}

export async function getPlayerRewards(playerId: number): Promise<PlayerReward[]> {
	return rewardRepository.find({
		where: {
			player: {
				id: playerId
			}
		},
		select: ['rewardId']
	});
}
