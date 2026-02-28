import { PismaClientLocal } from '../prisma.js';
import TournamentManager from './tournamentManager.js';

type TournamentCacheData = { winners: { tournamentTeamId: string }[]; id: string } | null;

let cache: TournamentCacheData | undefined = undefined; // undefined = jamais chargé, null = pas de tournoi actif

export function invalidateTournamentCache() {
	cache = undefined;
}

export async function getActiveTeamsCached(prisma: PismaClientLocal) {
	if (cache !== undefined) {
		return cache;
	}
	cache = await TournamentManager.getActiveTeams(prisma);
	return cache;
}
