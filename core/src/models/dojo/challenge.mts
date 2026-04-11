import { FullFightStats } from '../fight/FightResult.mjs';

export enum ChallengeType {
	// Beat the opponent
	Kill = 'kill',
	// Receive less than N attacks
	TakeAttackQuantity = 'takeAttack',
	// Lose less than N hp
	TakeRawDamage = 'takeRawDmg',
	// Lose less than X% of hp
	TakePercentDamage = 'takePrctDmg',
	// Do at least N assaults
	Assault = 'assault',
	// X% of attacks are assaults
	AssaultPercentage = 'assaultPrct',
	// Deal up to N damage
	DealDamage = 'maxDmg',
	// Deal at least X% of starting hp
	DealPercentDamage = 'minPrctDmg',
	// Counter a minimum of N times
	CounterAttack = 'counter',
	// Dodge a minimum of N times
	Dodge = 'dodge',
	// Never get poisoned
	DodgePoison = 'noPoison',
	// Poison the opponent at least once
	PoisonOpponent = 'poison'
}

export type Challenge = {
	type: ChallengeType;
	goal: number;
};

export const challengeRanges: Readonly<Record<ChallengeType, [number, number]>> = {
	[ChallengeType.Kill]: [1, 1], // Kill opponent
	[ChallengeType.TakeAttackQuantity]: [2, 10], // Take at max x attack from enemy
	[ChallengeType.TakeRawDamage]: [10, 80], // Take at max x damage from enemy
	[ChallengeType.TakePercentDamage]: [5, 50], // Take less damage than x% of your life
	[ChallengeType.Assault]: [2, 10], // Do at least x assault
	[ChallengeType.AssaultPercentage]: [10, 50], // Do at least x% of assault among your attack
	[ChallengeType.DealDamage]: [30, 100], // Inflict less than x damage to the opponent
	[ChallengeType.DealPercentDamage]: [10, 50], // Inflict at least x% of damage to the opponent
	[ChallengeType.CounterAttack]: [1, 3], // Do at least x counter attack
	[ChallengeType.Dodge]: [1, 3], // Do at least x dodge
	[ChallengeType.DodgePoison]: [1, 1], // Don't be poisoned
	[ChallengeType.PoisonOpponent]: [1, 1] // Poison opponent at least once
};

/**
 * @summary Returns the difference between the challenge goal and the statistic. If zero or negative, the challenge was passed. If positive, the challenge was failed.
 * @param challenge {Challenge}
 * @param stats {FullFightStats}
 * @return number
 */
export function parseChallenge(challenge: Challenge, stats: FullFightStats) {
	switch (challenge.type) {
		case ChallengeType.Kill:
			// Challenge is successful if defense has no hp left, i.e <= 0
			return stats.defense.endingHp;
		case ChallengeType.TakeAttackQuantity:
			// Challenge is successful is attack received less than N attacks, i.e <= 0
			return stats.attack.times_attacked - challenge.goal;
		case ChallengeType.TakeRawDamage:
			// Challenge is successful if attack lost less than N HP, i.e <= 0
			return stats.attack.hpLost - challenge.goal;
		case ChallengeType.TakePercentDamage:
			// Challenge is successful if attack lost less than X% of HP, i.e <= 0
			return ((stats.attack.startingHp - stats.attack.endingHp) / stats.attack.startingHp) * 100 - challenge.goal;
		case ChallengeType.Assault:
			// Challenge is successful if attack did at least N assaults, i.e <= 0
			return challenge.goal - stats.attack.assaults;
		case ChallengeType.AssaultPercentage:
			// Challenge is successful if X% of attacks are assaults, i.e <= 0
			return challenge.goal - (stats.attack.assaults / stats.attack.attacks) * 100;
		case ChallengeType.DealDamage:
			// Challenge is successful if defense lost up to N HP, i.e <= 0
			return stats.defense.hpLost - challenge.goal;
		case ChallengeType.DealPercentDamage:
			// Challenge is successful if defense lost at least X% of HP, i.e <= 0
			return challenge.goal - ((stats.defense.startingHp - stats.defense.endingHp) / stats.defense.startingHp) * 100;
		case ChallengeType.CounterAttack:
			// Challenge is successful if attack countered at least N times, i.e <= 0
			return challenge.goal - stats.attack.counters;
		case ChallengeType.Dodge:
			// Challenge is successful if attack dodge a least N times, i.e <= 0
			return challenge.goal - stats.attack.evasions;
		case ChallengeType.DodgePoison:
			// Challenge is successful if defense never inflicted poison, i.e <= 0
			return stats.defense.poisoned;
		case ChallengeType.PoisonOpponent:
			// Challenge is successful if attack poisoned at least once, i.e <= 0
			return 1 - stats.attack.poisoned;
		default:
			return 0;
	}
}
