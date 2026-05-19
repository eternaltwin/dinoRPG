import { ResolvedWar } from '../dao/clansDao.js';

export function computeWarPowers(war: ResolvedWar, attackerWon: boolean) {
	const attackerRanking = war.attacker.clanWarRanking[0];
	const defenderRanking = war.defender.clanWarRanking[0];

	const pWin = computePWin(attackerRanking.reputation, defenderRanking.reputation);
	const pLost = computePLost(attackerRanking.reputation, defenderRanking.reputation);

	return {
		attacker: {
			attackerPWin: attackerWon ? Math.round(pWin) : 0,
			attackerPLost: attackerWon ? 0 : Math.round(pLost)
		},
		defender: {
			defenderPWin: attackerWon ? 0 : Math.round(pWin),
			defenderPLost: attackerWon ? Math.round(pLost) : 0
		}
	};
}

export function computePWin(yourRank: number, enemyRank: number): number {
	const raw = (100 * (10000 + enemyRank)) / (10000 + yourRank);
	return clamp(raw, 10, 300);
}

export function computePLost(yourRank: number, enemyRank: number): number {
	const raw = (100 * (10000 + yourRank)) / (10000 + enemyRank);
	return clamp(raw, 10, 300);
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}
