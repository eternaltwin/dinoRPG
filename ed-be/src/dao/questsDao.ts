import { prisma } from '../prisma.js';

export async function createQuest(playerId: number, questId: number) {
	return prisma.playerQuest.create({
		data: {
			questId: questId,
			progression: 1,
			player: { connect: { id: playerId } }
		}
	});
}

export async function updateQuest(playerId: number, questId: number, step: number) {
	return prisma.playerQuest.update({
		where: {
			questId_playerId: { questId, playerId }
		},
		data: { progression: step }
	});
}
