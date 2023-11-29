import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';

//TODO
export async function addRewardToPlayer(reward: Prisma.PlayerRewardCreateInput) {
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
