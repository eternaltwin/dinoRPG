export enum ChallengeType {
	Kill,
	PoisonOpponent,
	TakePercentDamage,
	DealDamage,
	DealPercentDamage,
	CounterAttack,
	Dodge,
	Assault,
	AssaultPercentage,
	DodgePoison,
	TakeAttackQuantity,
	TakeRawDamage
}

export type Challenge = {
	type: ChallengeType;
	goal: number;
};

export const challengeRanges: Readonly<Record<ChallengeType, [number, number]>> = {
	[ChallengeType.Kill]: [1, 1], //Kill oponent
	[ChallengeType.PoisonOpponent]: [1, 1], // Poison opponent at least once
	[ChallengeType.TakePercentDamage]: [5, 50], //Take less damage than x% of your life
	[ChallengeType.DealDamage]: [30, 100], //Inflict less than x damage to the opponent
	[ChallengeType.DealPercentDamage]: [10, 50], //Inflict at least x% of damage to the opponent
	[ChallengeType.CounterAttack]: [1, 3], //Do at least x counter attack
	[ChallengeType.Dodge]: [1, 3], //Do at least x dodge
	[ChallengeType.Assault]: [2, 10], //Do at least x assault
	[ChallengeType.AssaultPercentage]: [10, 50], //Do at least x% of assault among your attack
	[ChallengeType.DodgePoison]: [1, 1], // Don't be poisoned
	[ChallengeType.TakeAttackQuantity]: [2, 10], // Take at max x attack from ennemi
	[ChallengeType.TakeRawDamage]: [10, 80] // Take at max x damage from ennemi
};
