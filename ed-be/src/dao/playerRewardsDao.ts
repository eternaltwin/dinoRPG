import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { setSpecificStat } from './trackingDao.js';
import { Reward, rewardList } from '@drpg/core/models/reward/RewardList';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

//TODO
export async function addRewardToPlayer(reward: Prisma.PlayerRewardCreateInput) {
	const rewardStat = Object.values(rewardList).find(r => r.id === reward.rewardId);
	const playerId = reward.player?.connect?.id;
	if (!rewardStat || !playerId) throw new ExpectedError(`Epic reward not found`);
	if (rewardStat.displayed && rewardStat.id !== Reward.BETA) {
		await setSpecificStat(rewardStat.name, playerId, 1);
	}
	return prisma.playerReward.upsert({
		where: {
			rewardId_playerId: {
				playerId: playerId,
				rewardId: reward.rewardId
			}
		},
		update: {},
		create: {
			rewardId: reward.rewardId,
			playerId: playerId
		}
	});
}

//TODO
export async function addMultipleRewardToPlayer(rewards: Prisma.PlayerRewardCreateManyInput[]) {
	await prisma.playerReward.createMany({
		data: rewards
	});
}

export async function removeRewardFromPlayer(playerId: string, rewardId: number) {
	await prisma.playerReward.delete({
		where: { rewardId_playerId: { rewardId, playerId } }
	});
}

export async function getPlayerRewards(playerId: string) {
	return prisma.playerReward.findMany({
		where: {
			playerId
		},
		select: {
			rewardId: true
		}
	});
}
