import { prisma } from '../prisma.js';

export function setSpecificStat(stat: string, playerId: number, quantity: number) {
	return prisma.playerTracking.upsert({
		where: { stat_playerId: { stat, playerId } },
		update: {
			quantity: { increment: quantity }
		},
		create: {
			stat: stat,
			quantity: quantity,
			playerId: playerId
		}
	});
}
