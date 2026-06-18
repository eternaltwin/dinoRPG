import { describe, it, expect } from 'vitest';
import {
	computePLost,
	computePWin,
	computeProspectorUpdate,
	computeWarPowers,
	computeWarRankingUpdates
} from '../../utils/warCalculation.js';
import {
	PROSPECTOR_DESTROYED_PENALTY_BASE,
	PROSPECTOR_STANDING_REWARD_BASE,
	PROSPECTOR_STREAK_CAP
} from '@drpg/core/models/clan/clanWar';
import type { ResolvedWar } from '../../dao/clansDao.js';

type Ranking = { reputation: number; totalPWin: number; totalPLost: number; downtimeCount: number };

// Builds the minimal slice of a ResolvedWar that the war-calculation helpers actually read.
// Pass `null` for a side to simulate a clan that has no ranking row yet (empty array).
function makeWar(attacker: Partial<Ranking> | null, defender: Partial<Ranking> | null): ResolvedWar {
	const ranking = (r: Partial<Ranking> | null) =>
		r === null ? [] : [{ reputation: 100, totalPWin: 0, totalPLost: 0, downtimeCount: 0, ...r }];
	return {
		attacker: { id: 1, clanWarRanking: ranking(attacker) },
		defender: { id: 2, clanWarRanking: ranking(defender) }
	} as unknown as ResolvedWar;
}

describe('computePWin / computePLost', () => {
	it('returns 100 when both reputations are equal', () => {
		expect(computePWin(100, 100)).toBe(100);
		expect(computePLost(100, 100)).toBe(100);
	});

	it('clamps the upper bound to 300', () => {
		// A weak clan (rank 0) beating a strong one (rank 10000) would earn far more than 300.
		expect(computePWin(0, 10000)).toBe(300);
		expect(computePLost(10000, 0)).toBe(300);
	});

	it('clamps the lower bound to 10', () => {
		// A strong clan (rank 10000) beating a weak one (rank 0) would earn far less than 10.
		expect(computePWin(10000, 0)).toBe(10);
		expect(computePLost(0, 10000)).toBe(10);
	});
});

describe('computeWarPowers', () => {
	it('awards pWin to the attacker and pLost to the defender on an attacker win', () => {
		const powers = computeWarPowers(makeWar({ reputation: 100 }, { reputation: 100 }), true);
		expect(powers.attacker).toEqual({ attackerPWin: 100, attackerPLost: 0 });
		expect(powers.defender).toEqual({ defenderPWin: 0, defenderPLost: 100 });
	});

	it('awards pLost to the attacker and pWin to the defender on an attacker loss', () => {
		const powers = computeWarPowers(makeWar({ reputation: 100 }, { reputation: 100 }), false);
		expect(powers.attacker).toEqual({ attackerPWin: 0, attackerPLost: 100 });
		expect(powers.defender).toEqual({ defenderPWin: 100, defenderPLost: 0 });
	});

	it('defaults a missing ranking to reputation 100', () => {
		// No ranking row on either side -> behaves exactly like 100 vs 100.
		const powers = computeWarPowers(makeWar(null, null), true);
		expect(powers.attacker.attackerPWin).toBe(100);
		expect(powers.defender.defenderPLost).toBe(100);
	});
});

describe('computeWarRankingUpdates', () => {
	it('never adds downtime to the attacker but adds one to the defender when its castle is destroyed', () => {
		const war = makeWar({ downtimeCount: 0 }, { downtimeCount: 2 });
		const [attacker, defender] = computeWarRankingUpdates(war, true, true);

		expect(attacker.clanId).toBe(1);
		expect(attacker.downtimeCount).toBe(0);
		expect(defender.clanId).toBe(2);
		expect(defender.downtimeCount).toBe(3);
	});

	it('resets the defender downtime to 0 when its castle survives', () => {
		const war = makeWar({ downtimeCount: 0 }, { downtimeCount: 5 });
		const [, defender] = computeWarRankingUpdates(war, false, false);
		expect(defender.downtimeCount).toBe(0);
	});

	it('accumulates totalPWin / totalPLost onto the existing ranking totals', () => {
		const war = makeWar({ totalPWin: 50, totalPLost: 10 }, { totalPWin: 0, totalPLost: 0 });
		const [attacker] = computeWarRankingUpdates(war, true, false);
		// attacker won 100 power on top of its existing 50.
		expect(attacker.totalPWin).toBe(150);
		expect(attacker.totalPLost).toBe(10);
	});

	it('drops a side that has no ranking row', () => {
		const updates = computeWarRankingUpdates(makeWar({ reputation: 100 }, null), true, true);
		expect(updates).toHaveLength(1);
		expect(updates[0].clanId).toBe(1);
	});

	it('recomputes reputation to 100 for a fresh, balanced ranking', () => {
		const war = makeWar({ totalPWin: 0, totalPLost: 0, downtimeCount: 0 }, null);
		const [attacker] = computeWarRankingUpdates(war, true, false);
		// 100 * ((500 + 100) / (500 + 0))^0.8 ... with the freshly added 100 pWin.
		expect(attacker.reputation).toBe(Math.round(100 * Math.pow(600 / 500, 0.8)));
	});
});

describe('computeProspectorUpdate', () => {
	const base = {
		clanId: 1,
		totalPWin: 0,
		totalPLost: 0,
		downtimeCount: 3,
		castleStandingStreak: 0,
		castleDownStreak: 0
	};

	it('rewards a standing castle, growing the streak and resetting the down streak', () => {
		const update = computeProspectorUpdate({ ...base, castleDownStreak: 4 }, true);
		expect(update.castleStandingStreak).toBe(1);
		expect(update.castleDownStreak).toBe(0);
		expect(update.totalPWin).toBe(PROSPECTOR_STANDING_REWARD_BASE * 1);
		expect(update.totalPLost).toBe(0);
	});

	it('penalises a destroyed castle, growing the streak and resetting the standing streak', () => {
		const update = computeProspectorUpdate({ ...base, castleDownStreak: 4 }, false);
		expect(update.castleDownStreak).toBe(5);
		expect(update.castleStandingStreak).toBe(0);
		expect(update.totalPLost).toBe(PROSPECTOR_DESTROYED_PENALTY_BASE * 4);
		expect(update.totalPWin).toBe(0);
	});

	it('caps the reward multiplier at PROSPECTOR_STREAK_CAP', () => {
		// Already at the cap; one more standing visit must not multiply beyond the cap.
		const update = computeProspectorUpdate({ ...base, castleStandingStreak: PROSPECTOR_STREAK_CAP }, true);
		expect(update.castleStandingStreak).toBe(PROSPECTOR_STREAK_CAP + 1);
		expect(update.totalPWin).toBe(PROSPECTOR_STANDING_REWARD_BASE * PROSPECTOR_STREAK_CAP);
	});

	it('carries downtimeCount through untouched', () => {
		expect(computeProspectorUpdate(base, true).downtimeCount).toBe(3);
		expect(computeProspectorUpdate(base, false).downtimeCount).toBe(3);
	});
});
