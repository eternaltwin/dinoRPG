import { prisma } from '../prisma.js';
import { withSpan } from '../utils/server/tracing.js';

export async function getLatestTournament() {
	return withSpan(getLatestTournament.name, async () => {
		return await prisma.tournament.findFirst({
			orderBy: {
				date: 'desc'
			},
			select: {
				id: true,
				date: true,
				raceMinimum: true,
				teamRace: true,
				teamSize: true,
				levelLimit: true
			}
		});
	});
}

export async function incrementCashPrice(tournamentId: string, quantity: number) {
	return withSpan(incrementCashPrice.name, async () => {
		await prisma.tournament.update({
			where: {
				id: tournamentId
			},
			data: {
				cashPrice: { increment: quantity }
			}
		});
	});
}
