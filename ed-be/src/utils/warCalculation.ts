import { ResolvedWar } from '../dao/clansDao.js';

export function computeWarPowers(war: ResolvedWar, attackerWon: boolean) {
	const attackerRanking = war.attacker.clanWarRanking[0];
	const defenderRanking = war.defender.clanWarRanking[0];

	const attackerRep = attackerRanking?.reputation ?? 100;
	const defenderRep = defenderRanking?.reputation ?? 100;

	const pWin = computePWin(attackerRep, defenderRep);
	const pLost = computePLost(attackerRep, defenderRep);

	return {
		attacker: {
			attackerPWin: attackerWon ? Math.round(pWin) : 0,
			attackerPLost: attackerWon ? 0 : Math.round(pLost)
		},
		defender: {
			defenderPWin: attackerWon ? 0 : Math.round(pLost),
			defenderPLost: attackerWon ? Math.round(pWin) : 0
		}
	};
}

export function computePWin(yourRank: number, enemyRank: number): number {
	const raw = (100 * (100 + enemyRank)) / (100 + yourRank);
	return clamp(raw, 10, 300);
}

export function computePLost(yourRank: number, enemyRank: number): number {
	const raw = (100 * (100 + yourRank)) / (100 + enemyRank);
	return clamp(raw, 10, 300);
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}
