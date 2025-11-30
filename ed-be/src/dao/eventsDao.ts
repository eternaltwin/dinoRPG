import { GameEvent } from '@drpg/core/models/event/Events';
import { prisma } from '../prisma.js';

export async function getPlayerEventProgression(playerId: string, event: GameEvent) {
	const informations = await prisma.events.findUnique({
		where: {
			event_playerId: { playerId, event }
		}
	});
	return informations;
}

export async function increasePlayerEventProgression(playerId: string, event: GameEvent) {
	await prisma.events.upsert({
		where: {
			event_playerId: { playerId, event }
		},
		update: {
			totalProgression: { increment: 1 },
			dailyProgression: { increment: 1 }
		},
		create: {
			totalProgression: 1,
			dailyProgression: 1,
			event: event,
			playerId: playerId
		}
	});
}
