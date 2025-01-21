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
	PoisonOpponent = 'poison',
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
	[ChallengeType.PoisonOpponent]: [1, 1], // Poison opponent at least once
};
