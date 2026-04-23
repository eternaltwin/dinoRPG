import { ClanWar } from '@drpg/prisma';

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

export function computePWin(yourRank: number, enemyRank: number): number {
	const raw = (100 * (10000 + enemyRank)) / (10000 + yourRank);
	return clamp(raw, 10, 300);
}

export function computePLost(yourRank: number, enemyRank: number): number {
	const raw = (100 * (10000 + yourRank)) / (10000 + enemyRank);
	return clamp(raw, 10, 300);
}

export function sum(values: number[]): number {
	return values.reduce((acc, v) => acc + v, 0);
}

export function computeTotals(pwins: number[], plosts: number[]) {
	return {
		totalPWin: sum(pwins),
		totalPLost: sum(plosts)
	};
}

export function computeReputation(totalPWin: number, totalPLost: number): number {
	const ratio = (500 + totalPWin) / (500 + totalPLost);
	return 100 * Math.pow(ratio, 0.8);
}

export function computeRepLost(consecutiveResetsDown: number): number {
	const n = consecutiveResetsDown;
	return (n * (n - 1)) / 2;
}

export function computeTotalRepLost(periods: number[]): number {
	return periods.reduce((acc, n) => acc + computeRepLost(n), 0);
}

export function computeFinalReputation(totalPWin: number, totalPLost: number, downtimePeriods: number[]): number {
	const rep = computeReputation(totalPWin, totalPLost);
	const repLost = computeTotalRepLost(downtimePeriods);

	return rep + repLost;
}

export function getEffectiveRepForRank(rep: number): number {
	return Math.min(rep, 500);
}

export function computeWarPowers(war: Pick<ClanWar, 'isCastleDestroyed'>) {
	const attackerWon = war.isCastleDestroyed;

	const attackerPWin = attackerWon ? 100 : 10;
	const attackerPLost = attackerWon ? 10 : 100;

	const defenderPWin = attackerWon ? 10 : 100;
	const defenderPLost = attackerWon ? 100 : 10;

	return {
		attacker: { attackerPWin, attackerPLost },
		defender: { defenderPWin, defenderPLost }
	};
}
