import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { setSpecificStat } from './trackingDao.js';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import { ErrorFormator } from '../utils/errorFormator.js';

//TODO
export async function addRewardToPlayer(reward: Prisma.PlayerRewardCreateInput) {
	const rewardStat = Object.entries(rewardList).find(r => r[1] === reward.rewardId);
	const playerId = reward.player?.connect?.id;
	if (!rewardStat || !playerId) throw new ErrorFormator(500, `Epic reward not found`);
	await setSpecificStat(rewardStat[0].toLowerCase(), playerId, 1);
	return prisma.playerReward.create({
		data: reward
	});
}

//TODO
export async function addMultipleRewardToPlayer(rewards: Prisma.PlayerRewardCreateManyInput[]) {
	await prisma.playerReward.createMany({
		data: rewards
	});
}

export async function removeRewardFromPlayer(playerId: number, rewardId: number) {
	await prisma.playerReward.delete({
		where: { rewardId_playerId: { rewardId, playerId } }
	});
}

export async function getPlayerRewards(playerId: number) {
	return prisma.playerReward.findMany({
		where: {
			playerId
		},
		select: {
			rewardId: true
		}
	});
}
