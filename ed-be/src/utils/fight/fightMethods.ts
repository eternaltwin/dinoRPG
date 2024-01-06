/* eslint-disable no-param-reassign */

import { DinozSkillFiche } from "@drpg/core/models/dinoz/DinozSkillFiche";
import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { DetailedFighter } from "@drpg/core/models/fight/DetailedFighter";
import { StepFighter } from "@drpg/core/models/fight/FightStep";
import { DetailedFight } from "./generateFight.js";
import getDamage from "./getDamage.js";
import randomBetween from "./randomBetween.js";
import { SkillType } from "@drpg/core/models/enums/SkillType";

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

const randomlyGetEvent = (fightData: DetailedFight, dinoz: DetailedFighter) => {
	// TODO: Handle items usage as an event

	const events = dinoz.skills.filter((skill) => skill.activatable && skill.type === SkillType.E);

	if (!events.length) return null;

	// Go through each event and roll the dice
	for (let i = 0; i < events.length; i++) {
		const event = events[i];

		// Skip if not enough energy
		if (dinoz.energy < event.energy) continue;

		if (randomBetween(0, 100) < (event.probability ?? 0)) {
			return event;
		}
	}

	return null;
};

const randomlyGetSkill = (fightData: DetailedFight, dinoz: DetailedFighter) => {
	const skills = dinoz.skills.filter((skill) => skill.activatable && skill.type === SkillType.A);

	if (!skills.length) return null;

	// Go through each event and roll the dice
	for (let i = 0; i < skills.length; i++) {
		const skill = skills[i];

		// Skip if not enough energy
		if (dinoz.energy < skill.energy) continue;

		if (randomBetween(0, 100) < (skill.probability ?? 0)) {
			return skill;
		}
	}

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
	fighter: Pick<DetailedFighter, 'id' | 'name' | 'type' | 'attacker' | 'nextHitBonus' | 'nextHitMultiplier' | 'activeSkills'>,
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
		// Add hit step
		fightData.steps.push({
			action: 'hit',
			fighter: stepFighter(fighter),
			target: stepFighter(opponent),
			damage: actualDamage[opponent.id],
			skill,
		});
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

	// Expire Skill.COLERE if present
	if (fighter.activeSkills.includes(Skill.COLERE)) {
		fighter.activeSkills = fighter.activeSkills.filter((skill) => skill !== Skill.COLERE);

		// Add skillExpire step
		fightData.steps.push({
			action: 'skillExpire',
			dinoz: stepFighter(fighter),
			skill: Skill.COLERE,
		});
	}
};

const evadedSkill = (opponent: DetailedFighter, skill: DinozSkillFiche) => {
	if (opponent.hp <= 0) return false;

	let evasion = 0;

	// 10% chance to evade skills A with Skill.DEPLACEMENT_INSTANTANE
	if (skill.type === SkillType.A && opponent.skills.find((s) => s.id === Skill.DEPLACEMENT_INSTANTANE)) {
		evasion += 0.1;
	}

	const random = Math.random();

	return random < evasion;
};

const targetSingleOpponent = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	skill: DinozSkillFiche,
) => {
	// Get random opponent
	const opponent = getRandomOpponent(fightData, fighter);

	// Check if opponent evaded
	if (evadedSkill(opponent, skill)) {
		// Add evade step
		fightData.steps.push({
			action: 'evade',
			fighter: stepFighter(opponent),
		});

		return;
	}

	// Get damage
	const damage = getDamage(fighter, opponent, skill.id);

	// Register the hit
	registerHit(fightData, fighter, [opponent], damage, skill.id);
}

const targetAllOpponents = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	skill: DinozSkillFiche,
) => {
	// Attack each opponent
	const opponents = getOpponents(fightData, fighter);

	opponents.forEach((opponent) => {
		// Check if opponent evaded
		if (evadedSkill(opponent, skill)) {
			// Add evade step
			fightData.steps.push({
				action: 'evade',
				fighter: stepFighter(opponent),
			});

			return;
		}

		// Get damage
		const damage = getDamage(fighter, opponent, skill.id);

		// Register the hit
		registerHit(fightData, fighter, [opponent], damage, skill.id);
	});
};

const activateEvent = (
	fightData: DetailedFight,
	skill: DinozSkillFiche,
): boolean => {
	// Get current fighter
	const fighter = fightData.fighters[0];

	switch (skill.id) {
		// FIRE
		case Skill.COLERE: {
			fighter.nextHitMultiplier *= 1.25;

			// Add to active skills
			fighter.activeSkills.push(skill.id);
			break;
		}
		case Skill.COMBUSTION: {
			targetAllOpponents(fightData, fighter, skill);
			break;
		}
		default:
			return false;
	}

	// Consume energy
	fighter.energy -= skill.energy;

	// Add skillActivate step
	fightData.steps.push({
		action: 'skillActivate',
		dinoz: stepFighter(fighter),
		skill: skill.id,
		energy: skill.energy,
	});

	return true;
};

const activateSkill = (
	fightData: DetailedFight,
	skill: DinozSkillFiche,
): boolean => {
	// Get current fighter
	const fighter = fightData.fighters[0];

	switch (skill.id) {
		// FIRE
		case Skill.SOUFFLE_ARDENT: {
			targetAllOpponents(fightData, fighter, skill);
			break;
		}
		case Skill.PAUME_CHALUMEAU: {
			targetSingleOpponent(fightData, fighter, skill);

			// Increase initiative
			fighter.initiative += 1.5;
			break;
		}
		case Skill.KAMIKAZE: {
			targetSingleOpponent(fightData, fighter, skill);

			// Loose 50% HP
			const hpLost = Math.round(fighter.hp / 2);
			fighter.hp -= hpLost;

			// Add looseHp step
			fightData.steps.push({
				action: 'looseHp',
				fighter: stepFighter(fighter),
				hp: hpLost,
			});
			break;
		}
		default:
			return false;
	}

	// Consume energy
	fighter.energy -= skill.energy;

	// Add skillActivate step
	fightData.steps.push({
		action: 'skillActivate',
		dinoz: stepFighter(fighter),
		skill: skill.id,
		energy: skill.energy,
	});

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

	// Regen energy for all fighters except the current one
	fightData.fighters.forEach((f) => {
		if (f.id === fighter.id) return;

		f.energy += (f.stats.special.energyRecovery ?? 1) * 5;
	});

	// Event activation
	const possibleEvent = randomlyGetEvent(fightData, fighter);
	if (possibleEvent) {
		activateEvent(fightData, possibleEvent);
	}

	// Skill activation
	const possibleSkill = randomlyGetSkill(fightData, fighter);
	if (possibleSkill) {
    // End turn if skill activated
    if (activateSkill(fightData, possibleSkill)) {
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
				activeSkills: [],
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
