import { prisma } from '../prisma.js';

export async function upsertQuest(playerId: string, questId: number, step: number) {
	return prisma.playerQuest.upsert({
		where: {
			questId_playerId: { questId, playerId }
		},
		update: { progression: step, tracking: 0 },
		create: {
			questId: questId,
			progression: 1,
			player: { connect: { id: playerId } }
		}
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
