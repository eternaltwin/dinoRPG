import { prisma } from '../prisma.js';

export async function getLatestTournament() {
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
}
