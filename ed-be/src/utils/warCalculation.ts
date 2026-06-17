import { ResolvedWar } from '../dao/clansDao.js';
import {
	PROSPECTOR_DESTROYED_PENALTY_BASE,
	PROSPECTOR_STANDING_REWARD_BASE,
	PROSPECTOR_STREAK_CAP
} from '@drpg/core/models/clan/clanWar';

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

export type WarRankingUpdate = {
	clanId: number;
	totalPWin: number;
	totalPLost: number;
	downtimeCount: number;
	reputation: number;
};

type ClanWarRanking = ResolvedWar['attacker']['clanWarRanking'][number];

export function computeWarRankingUpdates(
	war: ResolvedWar,
	attackerWon: boolean,
	isCastleDestroyed: boolean
): WarRankingUpdate[] {
	const powers = computeWarPowers(war, attackerWon);

	const attackerUpdate = buildRankingUpdate({
		clanId: war.attacker.id,
		ranking: war.attacker.clanWarRanking[0],
		pWin: powers.attacker.attackerPWin,
		pLost: powers.attacker.attackerPLost,
		// The attacker is never under siege, so its downtime never changes.
		nextDowntimeCount: count => count
	});

	const defenderUpdate = buildRankingUpdate({
		clanId: war.defender.id,
		ranking: war.defender.clanWarRanking[0],
		pWin: powers.defender.defenderPWin,
		pLost: powers.defender.defenderPLost,
		// A destroyed castle adds one downtime; surviving it resets the streak.
		nextDowntimeCount: count => (isCastleDestroyed ? count + 1 : 0)
	});

	return [attackerUpdate, defenderUpdate].filter((update): update is WarRankingUpdate => update !== undefined);
}

function buildRankingUpdate(params: {
	clanId: number;
	ranking: ClanWarRanking | undefined;
	pWin: number;
	pLost: number;
	nextDowntimeCount: (currentCount: number) => number;
}): WarRankingUpdate | undefined {
	const { clanId, ranking, pWin, pLost, nextDowntimeCount } = params;

	if (!ranking) {
		return undefined;
	}

	const totalPWin = ranking.totalPWin + pWin;
	const totalPLost = ranking.totalPLost + pLost;
	const downtimeCount = nextDowntimeCount(ranking.downtimeCount);
	const reputation = computeReputation(totalPWin, totalPLost, downtimeCount);

	return { clanId, totalPWin, totalPLost, downtimeCount, reputation };
}

export type ProspectorUpdate = WarRankingUpdate & {
	castleStandingStreak: number;
	castleDownStreak: number;
};

/**
 * Applies one Prospector visit to a single war-ranking row. A standing castle is rewarded with
 * escalating `totalPWin`, a destroyed one penalised with escalating `totalPLost`; the opposite
 * streak resets. Reputation is recomputed with the unchanged formula. `downtimeCount` is carried
 * through untouched — it is owned by war resolution.
 */
export function computeProspectorUpdate(
	ranking: {
		clanId: number;
		totalPWin: number;
		totalPLost: number;
		downtimeCount: number;
		castleStandingStreak: number;
		castleDownStreak: number;
	},
	castleStanding: boolean
): ProspectorUpdate {
	let { totalPWin, totalPLost, castleStandingStreak, castleDownStreak } = ranking;

	if (castleStanding) {
		castleStandingStreak += 1;
		castleDownStreak = 0;
		totalPWin += PROSPECTOR_STANDING_REWARD_BASE * Math.min(castleStandingStreak, PROSPECTOR_STREAK_CAP);
	} else {
		castleDownStreak += 1;
		castleStandingStreak = 0;
		totalPLost += PROSPECTOR_DESTROYED_PENALTY_BASE * Math.min(castleDownStreak, PROSPECTOR_STREAK_CAP);
	}

	const reputation = computeReputation(totalPWin, totalPLost, ranking.downtimeCount);

	return {
		clanId: ranking.clanId,
		totalPWin,
		totalPLost,
		downtimeCount: ranking.downtimeCount,
		reputation,
		castleStandingStreak,
		castleDownStreak
	};
}

function computeReputation(totalPWin: number, totalPLost: number, downtimeCount: number): number {
	const winLossRatio = (500 + totalPWin) / (500 + totalPLost);
	const downtimePenalty = (downtimeCount * (downtimeCount - 1)) / 2;
	return Math.round(100 * Math.pow(winLossRatio, 0.8) - downtimePenalty);
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
