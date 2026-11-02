import { calculatePvPxp } from '@drpg/core/utils/DinozUtils';

export interface PvpOpponent {
	level: number;
	life: number;
	maxLife: number;
	escaped: boolean;
}

/**
 * Raw (before bonus and rounding) PvP xp of a dinoz against the opposing team.
 * @param dinoz The dinoz earning xp
 * @param opponents Opposing fighters, with their life before the fight
 * @param teamLevel Sum of the levels of the dinoz's team
 */
export function computePvpXp(dinoz: { level: number }, opponents: PvpOpponent[], teamLevel: number): number {
	// Factor based on the level of the dinoz within its team.
	const teamFactor = dinoz.level / teamLevel;
	let xp = 0;
	for (const opponent of opponents) {
		if (opponent.escaped) continue;
		// Less xp when the opponent is strictly below the dinoz's level.
		const levelFactor = opponent.level >= dinoz.level ? 1 : 4 / (4 + (dinoz.level - opponent.level));
		// Less xp when the opponent was not at full life.
		const hpFactor = opponent.life / opponent.maxLife;
		xp += calculatePvPxp(opponent.level, dinoz.level) * levelFactor * hpFactor * teamFactor;
	}
	return xp;
}
