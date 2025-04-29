import { prisma } from '../prisma.js';

export async function createQuest(playerId: string, questId: number) {
	return prisma.playerQuest.create({
		data: {
			questId: questId,
			progression: 1,
			player: { connect: { id: playerId } }
		}
	});
}

export async function updateQuest(playerId: string, questId: number, step: number) {
	return prisma.playerQuest.update({
		where: {
			questId_playerId: { questId, playerId }
		},
		data: { progression: step, tracking: 0 }
	});
}

export async function getPlayerQuestProgression(playerId: string, questId: number) {
	return prisma.playerQuest.findFirst({
		where: {
			playerId: playerId,
			questId: questId
		},
		select: {
			progression: true,
			tracking: true
		}
	});
}

export async function increaseQuestProgression(playerId: string, questId: number, step: number, tracking?: number) {
	return prisma.playerQuest.update({
		where: {
			questId_playerId: { questId, playerId }
		},
		data: {
			progression: {
				increment: step
			},
			tracking: {
				increment: tracking ?? 0
			}
		}
	});
}

export async function decreaseQuestProgression(playerId: string, questId: number, step: number) {
	return prisma.playerQuest.update({
		where: {
			questId_playerId: { questId, playerId }
		},
		data: {
			progression: {
				decrement: step
			}
		}
	});
}
