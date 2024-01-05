/* eslint-disable no-param-reassign */

import { DinozSkillFiche } from "@drpg/core/models/dinoz/DinozSkillFiche";
import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { DetailedFighter } from "@drpg/core/models/fight/DetailedFighter";
import { StepFighter } from "@drpg/core/models/fight/FightStep";
import { DetailedFight } from "./generateFight.js";
import getDamage from "./getDamage.js";
import randomBetween from "./randomBetween.js";

export const getOpponents = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	dinozOnly?: boolean,
	monsterOnly?: boolean,
) => {
	let opponents = [];

	// Remove Dead fighters and same team
	opponents = fightData.fighters.filter((f) => f.hp > 0 && f.attacker !== fighter.attacker);

	if (dinozOnly) {
		opponents = opponents.filter((f) => f.type === 'dinoz');
	}

	if (monsterOnly) {
		opponents = opponents.filter((f) => f.type === 'monster');
	}

	return opponents;
};

const getRandomOpponent = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	dinozOnly?: boolean,
	monsterOnly?: boolean,
) => {
	const opponents = getOpponents(fightData, fighter, dinozOnly, monsterOnly);

	// Prioritize dinoz with Rock skill
	const withRock = opponents.filter((opponent) => opponent.skills.find((skill) => skill.id === Skill.ROCK));

	if (withRock.length) {
		const random = randomBetween(0, withRock.length - 1);

		return withRock[random];
	}

	const random = randomBetween(0, opponents.length - 1);

	return opponents[random];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const randomlyGetSuper = (fightData: DetailedFight, dinoz: DetailedFighter) => {
	// TODO

	// const supers = dinoz.skills.filter((skill) => skill.activatable);

	// if (!supers.length) return null;

	// const NO_SUPER_TOSS = 10;
	// const randomSuper = randomBetween(
	//   0,
	//   supers.reduce((acc, skill) => acc + (skill.toss || 0), 0) + NO_SUPER_TOSS,
	// );

	// let toss = 0;
	// for (let i = 0; i < supers.length; i += 1) {
	//   toss += supers[i].toss || 0;
	//   if (randomSuper < toss) {
	//     return supers[i];
	//   }
	// }

	return null;
};

export const stepFighter = (
	fighter: Pick<DetailedFighter, 'id' | 'name' | 'type' | 'attacker'>,
) => {
	const data: StepFighter = {
		id: fighter.id,
		name: fighter.name,
		type: fighter.type,
		attacker: fighter.attacker,
	};

	return data;
};

const registerHit = (
	fightData: DetailedFight,
	fighter: Pick<DetailedFighter, 'id' | 'name' | 'type' | 'attacker' | 'nextHitBonus' | 'nextHitMultiplier'>,
	opponents: DetailedFighter[],
	damage: number,
	skill?: Skill,
) => {
	const actualDamage: Record<number, number> = opponents.reduce((acc, opponent) => ({
		...acc,
		[opponent.id]: damage,
	}), {});

	opponents.forEach((opponent) => {
		// Reduce damage by bulle percentage
		if (opponent.stats.special.bubbleRate) {
			actualDamage[opponent.id] = Math.round(damage * opponent.stats.special.bubbleRate / 100);

			if (actualDamage[opponent.id] < damage) {
				// Add resist step
				fightData.steps.push({
					action: 'resist',
					dinoz: stepFighter(opponent),
				});
			}
		}

		// 5% chance to reduce damage by 5 if Skill.CUIRASSE
		if (opponent.skills.find((s) => s.id === Skill.CUIRASSE)) {
			const random = Math.random();

			if (random < 0.05) {
				actualDamage[opponent.id] -= 5;

				// Add resist step
				fightData.steps.push({
					action: 'resist',
					dinoz: stepFighter(opponent),
				});
			}
		}

		opponent.hp -= actualDamage[opponent.id];
	});

	opponents.forEach((opponent) => {
		if (skill) {
			switch (skill) {
				case Skill.SANG_ACIDE: {
					// Add hit step
					fightData.steps.push({
						action: 'poison',
						fighter: stepFighter(fighter),
						target: stepFighter(opponent),
						damage: actualDamage[opponent.id],
					});
					break;
				}
				default:
					console.warn(`Skill ${skill} not implemented`);
					break;
			}
		} else {
			// Add hit step
			fightData.steps.push({
				action: 'hit',
				fighter: stepFighter(fighter),
				target: stepFighter(opponent),
				damage: actualDamage[opponent.id],
			});
		}
	});


  opponents.forEach((opponent) => {
    // Survive with 1 HP if canSurvive
    if (opponent.canSurvive && opponent.hp <= 1) {
      opponent.canSurvive = false;
      opponent.hp = 1;

      // Add survival step
      fightData.steps.push({
        action: 'survive',
        dinoz: stepFighter(opponent),
      });
    }
  });

	// Remove next hit bonus
	fighter.nextHitBonus = 0;
	fighter.nextHitMultiplier = 1;
};

const activateSuper = (
	fightData: DetailedFight,
	skill: DinozSkillFiche,
): boolean => {
	// Get current fighter
	// const fighter = fightData.fighters[0];

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const evadedSkill = (opponent: DetailedFighter) => {
		if (opponent.hp <= 0) return false;

		let evasion = 0;

		// 10% chance to evade skill with Skill.DEPLACEMENT_INSTANTANE
		if (opponent.skills.find((s) => s.id === Skill.DEPLACEMENT_INSTANTANE)) {
			evasion += 0.1;
		}

		const random = Math.random();

		return random < evasion;
	};

	switch (skill.id) {
		case Skill.TORNADE: {
			// TODO
			break;
		}
		default:
			return false;
	}

	return true;
};

const counterAttack = (fighter: DetailedFighter, opponent: DetailedFighter) => {
	// No counter attack if opponent is dead
	if (opponent.hp <= 0) return false;

	const random = Math.random();

	return random < ((opponent.stats.special.counter ?? 0) / 100);
};

const evade = (opponent: DetailedFighter) => {
	// No evasion if opponent is dead
	if (opponent.hp <= 0) return false;

	const random = Math.random();

	return random < ((opponent.stats.special.evasion ?? 0) / 100);
};

const attack = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	opponent: DetailedFighter,
) => {
	// Abort if fighter is dead
	if (fighter.hp <= 0) return;

	// Get damage
	let damage = getDamage(fighter, opponent);

	const evaded = evade(opponent);

	// Add attempt step
	fightData.steps.push({
		action: 'attemptHit',
		fighter: stepFighter(fighter),
		target: stepFighter(opponent),
	});

	// Check if opponent evaded
	if (evaded) {
		damage = 0;

		// Add evade step
		fightData.steps.push({
			action: 'evade',
			fighter: stepFighter(opponent),
		});
	}

	// Register hit if damage was done
	if (damage) {
		registerHit(fightData, fighter, [opponent], damage);
	}

	// Change fighter element
	fighter.element = fighter.elements[fighter.elements.indexOf(fighter.element) + 1 % fighter.elements.length];
};

export const checkDeaths = (
	fightData: DetailedFight,
) => {
	let attackersAlive = 0;
	let defendersAlive = 0;

	for (let i = 0; i < fightData.fighters.length; i++) {
		const fighter = fightData.fighters[i];

		// Only add death step if fighter is dead and hasn't died yet
		if (fighter.hp <= 0 && fightData.steps.filter((step) => step.action === 'death'
			&& step.fighter.id === fighter.id
			&& step.fighter.name === fighter.name
			&& step.fighter.type === fighter.type).length === 0) {
			// Add death step
			fightData.steps.push({
				action: 'death',
				fighter: stepFighter(fighter),
			});
		}

		// Count alive fighters
		if (fighter.hp > 0) {
			if (fighter.attacker) {
				attackersAlive++;
			} else {
				defendersAlive++;
			}
		}
	}

	// Set loser if only one team is alive
	if (attackersAlive === 0) {
		fightData.loser = 'attackers';
	} else if (defendersAlive === 0) {
		fightData.loser = 'defenders';
	}
};

const startAttack = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	opponent: DetailedFighter,
	isCounter?: boolean,
) => {
	// Keep track of initial fighter HP
	const initialFighterHp = fighter.hp;

	// Trigger fighter attack
	attack(fightData, fighter, opponent);

	// Poison fighter if opponent has Skill.AURA_PUANTE
	if (opponent.skills.find((skill) => skill.id === Skill.AURA_PUANTE)) {
		fighter.poisonedBy = {
			id: opponent.id,
			type: opponent.type,
			skill: Skill.AURA_PUANTE,
		};
	}

	// Get combo chances
	const combo = (fighter.stats.special.multihit ?? 0) / 100;

	// Repeat attack only if not countering
	if (!isCounter) {
		let random = Math.random();
		while (random < combo) {
			// Stop the combo if the fighter took a hit
			if (fighter.hp < initialFighterHp) {
				break;
			}

			// Trigger fighter attack
			attack(fightData, fighter, opponent);

			random = Math.random();
		}
	}

	// Check if a fighter is dead
	checkDeaths(fightData);
};

export const playFighterTurn = (
	fightData: DetailedFight,
) => {
	const fighter = fightData.fighters[0];

	// Super activation
	const possibleSuper = randomlyGetSuper(fightData, fighter);
	if (possibleSuper) {
		// End turn if super activated
		if (activateSuper(fightData, possibleSuper)) {
			return;
		}
	}

	// Get opponent
	const opponent = getRandomOpponent(fightData, fighter);

	const countered = counterAttack(fighter, opponent);

	// Add moveTo step
	fightData.steps.push({
		action: 'moveTo',
		fighter: stepFighter(fighter),
		target: stepFighter(opponent),
		countered,
	});

	// Check if opponent is not trapped and countered
	if (countered) {
		// Add counter step
		fightData.steps.push({
			action: 'counter',
			fighter: stepFighter(opponent),
			opponent: stepFighter(fighter),
		});

		// Opponent attacks fighter
		startAttack(fightData, opponent, fighter, true);
	} else {
		// Fighter attacks opponent
		startAttack(fightData, fighter, opponent);
	}

	// Check if fighter is not dead
	if (fighter.hp > 0) {
		// Add moveBack step
		fightData.steps.push({
			action: 'moveBack',
			fighter: stepFighter(fighter),
		});
	}

	// Check if fighter is poisoned
	const poisonedBy = fighter.poisonedBy;
	if (!fightData.loser && fighter.hp > 0 && poisonedBy) {
		// Forced poison to end the fight
		if (poisonedBy.id === -666) {
			const poisoner = {
				id: -666,
				name: 'God',
				type: 'monster' as const,
				attacker: false,
				nextHitBonus: 0,
				nextHitMultiplier: 1,
			};

			// Register the hit
			registerHit(fightData, poisoner, [fighter], 100, Skill.SANG_ACIDE);
		} else {
			// Get poisoner
			const poisoner = fightData.fighters.find((f) => f.id === poisonedBy.id && f.type === poisonedBy.type);

			if (!poisoner) {
				throw new Error('Poisoner not found');
			}

			// Get poison damage
			let poisonDamage = 0;
			switch (poisonedBy.skill) {
				case Skill.SANG_ACIDE: {
					poisonDamage = poisoner.stats.special.acidBloodDamage ?? 1;
					break;
				}
				case Skill.AURA_PUANTE: {
					poisonDamage = 10;
					break;
				}
				default:
					console.warn(`Poison skill ${poisonedBy.skill} not implemented`);
					break;
			}


			// Register the hit
			registerHit(fightData, poisoner, [fighter], poisonDamage, poisonedBy.skill);
		}
	}

	// Increase own initiative (1 = a supposed turn) (lower is better)
	fighter.initiative += 1
		* fighter.stats.speed.global
		* fighter.stats.speed[fighter.element];
};
