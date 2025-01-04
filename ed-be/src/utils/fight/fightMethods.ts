/* eslint-disable no-param-reassign */

import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { SkillLevel } from '@drpg/core/models/dinoz/SkillLevel';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { SkillType } from '@drpg/core/models/enums/SkillType';
import {
	BadStatus,
	DetailedFighter,
	FighterStatus,
	FighterType,
	GoodStatus,
	Status,
	StatusLength
} from '@drpg/core/models/fight/DetailedFighter';
import {
	FightStep,
	InitStepFighter,
	LeaveAnimation,
	NotifyStep,
	SkillActivateStep,
	StepFighter
} from '@drpg/core/models/fight/FightStep';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { monsterList } from '@drpg/core/models/fight/MonsterList';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { Item } from '@drpg/core/models/item/ItemList';
import {
	ASSAULT_POWER,
	BASE_ENERGY_COST,
	CYCLE,
	DEFAULT_MAX_ENERGY,
	ENERGY_RECOVERY_BASE_FACTOR,
	FIGHT_INFINITE,
	MAXIMUM_COMBO_COUNT,
	MAXIMUM_MAX_ENERGY,
	MINIMUM_ENERGY_TO_ACT,
	TIME_BASE,
	TIME_FACTOR,
	VOID_ASSAULT_POWER
} from './fightConstants.js';
import { DetailedFight } from './generateFight.js';
import {
	applyBalanceDamage,
	calculateDamage,
	getAttackDefense,
	getElementalAttack,
	getMultiElementalAttack
} from './getDamage.js';
import { cloneDinoz, initializeMonster } from './getFighters.js';
import { randomBetweenMaxExcludedSeeded, randomBetweenSeeded } from './randomBetween.js';
import weightedRandom from './weightedRandom.js';
import { bossList } from '@drpg/core/models/fight/BossList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { FightStats } from '@drpg/core/models/fight/FightResult';
import { sendJSONToDiscord } from '../discord.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { LifeEffect, NotificationList } from '@drpg/core/models/fight/transpiler';
import seedrandom from 'seedrandom';

export const getFighters = (fightData: DetailedFight, limitTypes?: FighterType[]) => {
	let fighters = [];

	// Remove dead and escaped fighters
	fighters = fightData.fighters.filter(f => f.hp > 0 && !f.escaped);

	if (limitTypes?.length) {
		fighters = fighters.filter(f => limitTypes.includes(f.type));
	}

	return fighters;
};

export const getAllies = (fightData: DetailedFight, fighter: DetailedFighter, limitTypes?: FighterType[]) => {
	let allies = [];

	// Remove dead and escaped fighters and other team
	allies = fightData.fighters.filter(f => f.hp > 0 && !f.escaped && f.attacker === fighter.attacker);

	if (limitTypes?.length) {
		allies = allies.filter(f => limitTypes.includes(f.type));
	}

	return allies;
};

// Facilitates getting all opponents still in play
// Opponents that are dead or escaped are not counted
// Handles HYPNOSE too
export const getOpponents = (fightData: DetailedFight, fighter: DetailedFighter, limitTypes?: FighterType[]) => {
	let opponents = [];

	// Remove dead and escaped fighters and same team
	opponents = fightData.fighters.filter(f => f.hp > 0 && !f.escaped && f.attacker !== fighter.attacker);

	if (limitTypes?.length) {
		opponents = opponents.filter(f => limitTypes.includes(f.type));
	}

	return opponents;
};

const chooseRandomOpponentForAssault = (
	attacker: DetailedFighter,
	opponents: DetailedFighter[],
	rng: seedrandom.PRNG,
	power?: [ElementType, number][]
) => {
	// The attacker can hit flying units if it is itself flying or it has the capacity to.
	const canAttackFlying = attacker.canHitFlying || hasStatus(attacker, Status.FLYING);
	// The attacker can hit intangible units if it has the capacity to, the attack deals non-zero air damage, or its current element is air.
	const canHitIntangible =
		attacker.canHitIntangible ||
		(power ? power.some(val => val[0] === ElementType.AIR) : attacker.element === ElementType.AIR);

	// List all invalid opponents
	const unreachable_opponents: DetailedFighter[] = [];
	opponents.forEach(opponent => {
		// Filter out flying opponents if unreachable
		if (hasStatus(opponent, Status.FLYING) && !canAttackFlying) {
			unreachable_opponents.push(opponent);
		}
		// Filter out intangible opponents if unreachable
		else if (hasStatus(opponent, Status.INTANGIBLE) && !canHitIntangible) {
			unreachable_opponents.push(opponent);
		}
	});

	let filtered_opponents: DetailedFighter[] = [];
	if (unreachable_opponents.length !== opponents.length) {
		filtered_opponents = opponents.filter(o => !unreachable_opponents.includes(o));
	} else {
		filtered_opponents = opponents;
	}

	// Apply target filtering skills:
	// Reduce the list of targets to only those with rock
	const opponents_have_rock = opponents.some(opponent => opponent.hasRock);
	if (opponents_have_rock) {
		// Filter based on the fighters with the ROCK skill: if the opposing team has the rock skill,
		// then one chance out of 2 to target only the rock fighters
		if (randomBetweenMaxExcludedSeeded(rng, 0, 2) === 0) {
			filtered_opponents = filtered_opponents.filter(opponent => opponent.hasRock);
		}
	}

	// The filtering skills go in this order: 1. ANALYSE, 2. SANS PITIÉ, 3. CONCENTRATION.
	// They are cumulative but they are each meant to return one single target. Multiple in case of tie.
	// They can all be enabled/disabled so it's usually best to enable only one.

	// First: find best target based on defense if ANALYSE
	// Keep only the fighters with the worst defense for the current element of the attacker
	if (attacker.skills.find(skill => skill.id === Skill.ANALYSE)) {
		let worstDefense = Infinity;

		filtered_opponents.forEach(opponent => {
			const defense = opponent.stats.defense[attacker.element];

			if (defense < worstDefense) {
				worstDefense = defense;
			}
		});

		filtered_opponents = filtered_opponents.filter(
			opponent => opponent.stats.defense[attacker.element] === worstDefense
		);
	}

	// Second: target lowest HP opponent if Skill.SANS_PITIE
	// Keep only the fighters with the lowest HP
	if (attacker.skills.find(skill => skill.id === Skill.SANS_PITIE)) {
		let lowestHp = Infinity;

		filtered_opponents.forEach(opponent => {
			if (opponent.hp < lowestHp) {
				lowestHp = opponent.hp;
			}
		});

		filtered_opponents = filtered_opponents.filter(opponent => opponent.hp === lowestHp);
	}

	// Last: same target as before if CONCENTRATION
	// Focus only on the same target as the previous attacks, if that target still exists in the filtered list
	if (attacker.skills.find(skill => skill.id === Skill.CONCENTRATION)) {
		if (attacker.previousTarget) {
			const target = filtered_opponents.find(opponent => opponent.id === attacker.previousTarget);

			if (target) {
				return target;
			}
		}
	}

	if (!filtered_opponents.length) {
		sendJSONToDiscord('Error `No opponent left after applying filtering.', {
			fighter: attacker,
			opponents: opponents
		});
		throw new Error('No opponent left after applying filtering');
	}

	// If there are multiple opponents available, pick a random one
	const random = randomBetweenSeeded(rng, 0, filtered_opponents.length - 1);

	return filtered_opponents[random];
};

/// Choose a random opponent from a list
/// No filtering is applied
export const chooseRandomOpponent = (opponents: DetailedFighter[], rng: seedrandom.PRNG) => {
	const random = randomBetweenSeeded(rng, 0, opponents.length - 1);

	return opponents[random];
};

export const getLimitedRandomOpponent = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	limitTypes?: FighterType[]
) => {
	const opponents = getOpponents(fightData, fighter, limitTypes);

	return chooseRandomOpponent(opponents, fightData.rng);
};

export const getRandomOpponent = (fightData: DetailedFight, fighter: DetailedFighter) => {
	const opponents = getOpponents(fightData, fighter);
	if (!opponents.length) {
		sendJSONToDiscord('Error `No opponent found` in `getRandomOpponnent` after `getOpponents` was called.', {
			fightData: fightData,
			fighter: fighter
		});
		throw new Error('No opponent found');
	}

	const randomOpponent = chooseRandomOpponent(opponents, fightData.rng);

	if (!randomOpponent) {
		sendJSONToDiscord(
			'Error `No random opponent found` in `getRandomOpponnent` after `chooseRandomOpponent` was called.',
			{ fightData: fightData, fighter: fighter }
		);
		throw new Error('No random opponent found');
	}

	return randomOpponent;
};

export const getRandomOpponentForAssault = (fightData: DetailedFight, fighter: DetailedFighter) => {
	const opponents = getOpponents(fightData, fighter);
	if (!opponents.length) {
		return null;
	}

	const randomOpponent = chooseRandomOpponentForAssault(fighter, opponents, fightData.rng);

	if (!randomOpponent) {
		sendJSONToDiscord(
			'Error `No random opponent found` in `getRandomOpponnent` after `chooseRandomOpponent` was called.',
			{ fightData: fightData, fighter: fighter }
		);
		throw new Error('No random opponent found');
	}

	return randomOpponent;
};

export const updateStat = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	stat: keyof Omit<FightStats, 'elements'> | 'el.damage_dealt' | 'el.attacks' | 'el.damage_received' | 'el.defenses',
	value: number,
	element?: ElementType
) => {
	const stats = fighter.attacker ? fightData.stats.attack : fightData.stats.defense;

	if (stat === 'el.damage_dealt') {
		if (!element) {
			sendJSONToDiscord('Error `Element is required for damage stat` in `updateStat`.', {
				fightData: fightData,
				fighter: fighter,
				stat: stat,
				value: value,
				element: value
			});
			throw new Error('Element is required for damage stat');
		}

		stats.elements[element].damage_dealt += value;
		return;
	}

	if (stat === 'el.damage_received') {
		if (!element) {
			sendJSONToDiscord('Error `Element is required for damage stat` in `updateStat`.', {
				fightData: fightData,
				fighter: fighter,
				stat: stat,
				value: value,
				element: value
			});
			throw new Error('Element is required for damage stat');
		}

		stats.elements[element].damage_received += value;
		return;
	}

	if (stat === 'el.attacks') {
		if (!element) {
			sendJSONToDiscord('Error `Element is required for attacks stat` in `updateStat`.', {
				fightData: fightData,
				fighter: fighter,
				stat: stat,
				value: value,
				element: value
			});
			throw new Error('Element is required for attacks stat');
		}

		stats.elements[element].attacks += value;
		return;
	}

	if (stat === 'el.defenses') {
		if (!element) {
			sendJSONToDiscord('Error `Element is required for attacks stat` in `updateStat`.', {
				fightData: fightData,
				fighter: fighter,
				stat: stat,
				value: value,
				element: value
			});
			throw new Error('Element is required for attacks stat');
		}

		stats.elements[element].defenses += value;
		return;
	}

	stats[stat] += value;
};

export const setEnergy = (fighter: DetailedFighter, new_energy: number) => {
	let delta = 0;
	if (new_energy > fighter.maxEnergy) {
		delta = fighter.maxEnergy - fighter.energy;
		fighter.energy = fighter.maxEnergy;
	} else if (new_energy < 0) {
		delta = -fighter.energy;
		fighter.energy = 0;
	} else {
		delta = new_energy - fighter.energy;
		fighter.energy = new_energy;
	}
};

export const setMaxEnergy = (fighter: DetailedFighter, new_max: number) => {
	if (new_max > MAXIMUM_MAX_ENERGY) {
		fighter.maxEnergy = MAXIMUM_MAX_ENERGY;
	} else if (new_max < 0) {
		fighter.maxEnergy = 1;
	} else {
		fighter.maxEnergy = new_max;
	}

	// Don't go below DEFAULT_MAX_ENERGY if fighter has Item.ENCHANTED_STEROID
	if (fighter.maxEnergy < DEFAULT_MAX_ENERGY && fighter.items.some(item => item.itemId === Item.ENCHANTED_STEROID)) {
		fighter.maxEnergy = DEFAULT_MAX_ENERGY;
	}

	// Set fighter's current energy to minimum between energy and max energy
	// Note: This is not done in the original fight algo
	fighter.energy = Math.min(fighter.energy, fighter.maxEnergy);
};

const randomlyGetEvent = (fightData: DetailedFight, fighter: DetailedFighter) => {
	// No event if NO_EVENT
	if (hasStatus(fighter, Status.NO_EVENT)) return null;

	// Check if a time manipulator is present
	if (fightData.timeManipulatorUsed && !fightData.temporalStabilityUsed) return null;

	// Check if a fighter has Item.TIME_MANIPULATOR
	if (!fightData.timeManipulatorUsed) {
		const timeManipulator = getFighters(fightData).find(f =>
			f.items.some(item => item.itemId === Item.TIME_MANIPULATOR)
		);

		if (timeManipulator) {
			fightData.timeManipulatorUsed = true;

			// Add item use step
			fightData.steps.push({
				action: 'itemUse',
				fighter: stepFighter(timeManipulator),
				itemId: Item.TIME_MANIPULATOR
			});

			// Check if a fighter has Item.TEMPORAL_STABILISER
			const temporalStabiliser = getFighters(fightData).find(f =>
				f.items.some(item => item.itemId === Item.TEMPORAL_STABILISER)
			);

			if (temporalStabiliser) {
				fightData.temporalStabilityUsed = true;

				// Add item use step
				fightData.steps.push({
					action: 'itemUse',
					fighter: stepFighter(timeManipulator),
					itemId: Item.TEMPORAL_STABILISER
				});

				// Add to items used
				temporalStabiliser.itemsUsed.push(Item.TEMPORAL_STABILISER);

				// Get item index
				const itemIndex = temporalStabiliser.items.findIndex(item => item.itemId === Item.TEMPORAL_STABILISER);

				// Remove from items
				temporalStabiliser.items.splice(itemIndex, 1);
			} else {
				// Cancel all events
				return null;
			}
		}
	}

	const events: (SkillDetails | ItemFiche)[] = fighter.skills.filter(
		skill => skill.probability && skill.type === SkillType.E
	);

	events.push(...fighter.items.filter(item => item.probability));

	if (!events.length) return null;

	// Order events by priority
	events.sort((a, b) => {
		const aPriority = a.priority ?? 0;
		const bPriority = b.priority ?? 0;

		if (aPriority !== bPriority) {
			return bPriority - aPriority;
		}

		return fightData.rng() > 0.5 ? 1 : -1;
	});

	// Go through each event and roll the dice
	for (let i = 0; i < events.length; i++) {
		const event = events[i];

		// Check if event is a skill
		if ('id' in event) {
			// Skip if not enough energy
			if (fighter.energy < event.energy) continue;
		}

		if (randomBetweenSeeded(fightData.rng, 1, 100) < (event.probability ?? 0)) {
			return event;
		}
	}

	return null;
};

const randomlyGetSkill = (fightData: DetailedFight, fighter: DetailedFighter) => {
	// No skill if NO_SKILL
	if (hasStatus(fighter, Status.NO_SKILL)) return null;

	const skills = fighter.skills.filter(skill => skill.probability && skill.type !== SkillType.E);

	if (!skills.length) return null;

	const hasOracle = fighter.skills.some(skill => skill.id === Skill.ORACLE);

	// Order skills by priority
	skills.sort((a, b) => {
		const aPriority = a.priority ?? 0;
		const bPriority = b.priority ?? 0;

		if (aPriority !== bPriority) {
			return bPriority - aPriority;
		}

		return fightData.rng() > 0.5 ? 1 : -1;
	});

	// Go through each event and roll the dice
	for (let i = 0; i < skills.length; i++) {
		const skill = skills[i];

		// Skip if not enough energy
		if (fighter.energy < skill.energy) continue;

		let probability = skill.probability ?? 0;

		if (skill.type === SkillType.I && hasOracle) {
			// x2 probability if Skill.ORACLE
			probability *= 2;
		}

		if (randomBetweenSeeded(fightData.rng, 1, 100) < probability) {
			// Check if NO_INVOCATION
			if (skill.type === SkillType.I && hasStatus(fighter, Status.NO_INVOCATION)) {
				return null;
			}

			return skill;
		}
	}

	return null;
};

export const stepFighter = (fighter: Pick<DetailedFighter, 'id' | 'name' | 'type' | 'attacker'>) => {
	const data: StepFighter = {
		id: fighter.id,
		name: fighter.name,
		type: fighter.type,
		attacker: fighter.attacker
	};

	return data;
};

export const initStepFighter = (
	fighter: Pick<
		DetailedFighter,
		'id' | 'name' | 'type' | 'attacker' | 'display' | 'maxHp' | 'maxEnergy' | 'energy' | 'startingHp'
	>
) => {
	const data: InitStepFighter = {
		id: fighter.id,
		display: fighter.display ?? '',
		name: fighter.name,
		type: fighter.type,
		attacker: fighter.attacker,
		maxLife: fighter.maxHp,
		maxEnergy: fighter.maxEnergy,
		energy: fighter.energy,
		startingHp: fighter.startingHp
	};

	return data;
};

// TODO make sure to port the stuff from here to the appropriate places
// const registerHit = (
// 	fightData: DetailedFight,
// 	fighter: DetailedFighter,
// 	opponents: DetailedFighter[],
// 	damage: number,
// 	damageElements: ElementType[] = [],
// 	skill?: Skill,
// 	skillStep?: SkillActivateStep
// ) => {
// 	const actualDamage: Record<number, number> = opponents.reduce(
// 		(acc, opponent) => ({
// 			...acc,
// 			[opponent.id]: damage
// 		}),
// 		{}
// 	);

// 		/**
// 		 * POST-DAMAGE
// 		 */

// 		// Danger detector (prevent hit if damage > 25)
// 		if (opponent.items.some(item => item.itemId === Item.DANGER_DETECTOR) && actualDamage[opponent.id] > 25) {
// 			// Add item use step
// 			fightData.steps.push({
// 				action: 'itemUse',
// 				fighter: stepFighter(opponent),
// 				itemId: Item.DANGER_DETECTOR
// 			});

// 			// Add to items used
// 			opponent.itemsUsed.push(Item.DANGER_DETECTOR);

// 			// Get item index
// 			const itemIndex = opponent.items.findIndex(item => item.itemId === Item.DANGER_DETECTOR);

// 			// Remove from items
// 			opponent.items.splice(itemIndex, 1);

// 			// Restore HP
// 			opponent.hp += actualDamage[opponent.id];

// 			actualDamage[opponent.id] = 0;
// 		}

// 		// Survive with 1 HP if canSurvive
// 		if (opponent.canSurvive && opponent.hp <= 1) {
// 			opponent.canSurvive = false;
// 			opponent.hp = 1;

// 			// Add survival step
// 			fightData.steps.push({
// 				action: 'survive',
// 				dinoz: stepFighter(opponent)
// 			});
// 		}

// 		// Dimensional powder item

// 		// Check if any fighter has Item.DIMENSIONAL_POWDER
// 		const dimensionalPowderUser = getFighters(fightData).find(f =>
// 			f.items.some(item => item.itemId === Item.DIMENSIONAL_POWDER)
// 		);

// 		if (dimensionalPowderUser) {
// 			// Add item use step
// 			fightData.steps.push({
// 				action: 'itemUse',
// 				fighter: stepFighter(dimensionalPowderUser),
// 				itemId: Item.DIMENSIONAL_POWDER
// 			});

// 			// Escape opponent if HP requirement is met
// 			if (opponent.startingHp > 10 && opponent.hp > 0 && opponent.hp < 10) {
// 				// Add leave step
// 				fightData.steps.push({
// 					action: 'leave',
// 					fighter: stepFighter(opponent),
// 					animation: LeaveAnimation.BLACKHOLE
// 				});

// 				opponent.escaped = true;
// 			}
// 		}

// 		// LIFE_STEALER
// 		if (
// 			actualDamage[opponent.id] &&
// 			opponent.hp < 20 &&
// 			!hasStatus(opponent, Status.STOLE_LIFE) &&
// 			opponent.items.some(item => item.itemId === Item.LIFE_STEALER)
// 		) {
// 			// Steal 30 HP from a random opponent
// 			const randomOpponent = getRandomOpponent(fightData, opponent);

// 			// Add item use step
// 			fightData.steps.push({
// 				action: 'itemUse',
// 				fighter: stepFighter(opponent),
// 				itemId: Item.LIFE_STEALER
// 			});

// 			registerHit(fightData, opponent, [randomOpponent], 30);

// 			heal(fightData, opponent, 30);

// 			// Add status
// 			addStatus(fightData, opponent, Status.STOLE_LIFE);
// 		}

// 		// Remove costume if fire damage
// 		if (opponent.costume && damage && damageElements.includes(ElementType.FIRE)) {
// 			// Take 3 damage
// 			registerHit(fightData, opponent, [opponent], 3);

// 			// Add leave step
// 			fightData.steps.push({
// 				action: 'leave',
// 				fighter: stepFighter(opponent)
// 			});

// 			// Add remove costume step
// 			fightData.steps.push({
// 				action: 'removeCostume',
// 				fighter: stepFighter(opponent)
// 			});

// 			opponent.costume = undefined;

// 			// Add arrive step
// 			fightData.steps.push({
// 				action: 'arrive',
// 				fid: opponent.id
// 			});
// 		}

// 		// Skill.VIDE_ENERGETIQUE
// 		if (actualDamage[opponent.id] && opponent.skills.some(skill => skill.id === Skill.VIDE_ENERGETIQUE)) {
// 			// 1/6 Chance to reduce energy recovery
// 			if (randomBetween(0, 5) === 0) {
// 				fighter.stats.special.energyRecovery *= 0.85;

// 				// Add reduce energy step
// 				fightData.steps.push({
// 					action: 'reduceEnergy',
// 					fighter: stepFighter(fighter)
// 				});
// 			}
// 		}

// 		// Skill.SOURCE_DE_VIE
// 		if (actualDamage[opponent.id] && opponent.skills.some(skill => skill.id === Skill.SOURCE_DE_VIE)) {
// 			// 1/6 Chance to steal 5% HP
// 			if (randomBetween(0, 5) === 0) {
// 				const hpStolen = Math.round(opponent.hp * 0.05);

// 				registerHit(fightData, opponent, [fighter], hpStolen);
// 				heal(fightData, opponent, hpStolen);
// 			}
// 		}

// 	});
// };

// Triggers an attack of type assault, it targets a single target in close combat
// By default, it is assumed that the assault is a normal one (not triggered from a skill)
// This method will perform target selection with assault rules if no target is provided
// Unless specified, this is assimilated as a assault, will be able to combo and use assault bonuses
// Unless specified, the attacker will move to its target by default
const launchAssault = (
	fightData: DetailedFight,
	attacker: DetailedFighter,
	isAssault: boolean, // Defines if the assault can combo and use assault bonuses. Exception, no combo if power is set
	skill?: Skill,
	power?: [ElementType, number][],
	target?: DetailedFighter | null,
	goto?: boolean
) => {
	// Unless specified, this method will add to the history the move to and move back steps by default
	goto = goto ?? true;

	// Unless specified, pick a random opponent by default
	target = target ?? getRandomOpponentForAssault(fightData, attacker);

	if (target === null) {
		return null;
	}

	let realTarget = target;
	// Check if a dinoz is protecting the opponent and replace the target with the protector
	const protector = getOpponents(fightData, attacker).find(opponent => opponent.protecting === target!.id);
	if (protector) {
		// Add moveTo step
		fightData.steps.push({
			action: 'moveTo',
			fid: protector.id,
			tid: target.id
		});
		realTarget = protector;
	}

	if (goto) {
		// Add moveTo step
		fightData.steps.push({
			action: 'moveTo',
			fid: attacker.id,
			tid: realTarget.id,
			skill
		});
	}

	// Trigger fighter attack
	const result = attackTarget(fightData, attacker, realTarget, isAssault, power, skill);

	if (protector && protector.hp > 0) {
		fightData.steps.push({
			action: 'moveBack',
			fid: realTarget.id
		});
	}

	// Add moveBack step if attacker is still alive
	if (goto && attacker.hp > 0) {
		fightData.steps.push({
			action: 'moveBack',
			fid: attacker.id
		});
	}

	return result;
};

/// Triggers an attack from a skill that targets a single fighter
/// This method will perform target selection with non-close combat and skill rules if no target
/// is provided
const attackSingleOpponent = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	element_attack: [ElementType, number][],
	skill: Skill, // TODO rework for item too
	activate_step: FightStep,
	target?: DetailedFighter,
	goto?: boolean
) => {
	// Unless specified, pick random opponent by default
	const opponent = target ?? getRandomOpponent(fightData, fighter);
	let realOpponent = opponent;

	if (goto) {
		// Add moveTo step
		fightData.steps.push({
			action: 'moveTo',
			fid: fighter.id,
			tid: realOpponent.id,
			skill
		});
	}

	// Check if a dinoz is protecting the opponent and replace the target with the protector
	const protector = getOpponents(fightData, opponent).find(o => o.protecting === opponent.id);
	if (protector) {
		// Add moveTo step
		fightData.steps.push({
			action: 'moveTo',
			fid: protector.id,
			tid: opponent.id
		});
		realOpponent = protector;
	}

	// Add target
	(activate_step as SkillActivateStep).targets.push({ tid: realOpponent.id });

	const result = attackTarget(fightData, fighter, realOpponent, false, element_attack, skill, activate_step);

	// Add step
	fightData.steps.push(activate_step);

	if (goto) {
		// Add moveTo step
		fightData.steps.push({
			action: 'moveBack',
			fid: fighter.id
		});
	}

	if (protector && protector.hp > 0) {
		// Add moveBack step
		fightData.steps.push({
			action: 'moveBack',
			fid: realOpponent.id
		});
	}

	return result;
};

/// Triggers an attack from a skill that targets all fighters of the opposing team
/// This can be reduced to a specific count of targets with the `count` argument
const attackAllOpponents = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	element_attack: [ElementType, number][],
	skill: Skill, // TODO rework for item too
	activate_step: FightStep,
	opponents?: DetailedFighter[],
	count?: number
) => {
	// Attack each opponent
	const targets = opponents ?? getOpponents(fightData, fighter);

	// Reduce the list of impacted of opponents to a random count only if a specific count is impacted
	if (count) {
		while (targets.length > count) {
			const random_index = Math.round(fightData.rng() * targets.length);
			targets.splice(random_index, 1);
		}
	}

	targets.forEach(target => {
		let realTarget = target;
		// Check if a dinoz is protecting the opponent and replace the target with the protector
		const protector = getOpponents(fightData, target).find(opponent => opponent.protecting === target.id);
		if (protector) {
			// Add moveTo step
			fightData.steps.push({
				action: 'moveTo',
				fid: protector.id,
				tid: target.id
			});
			realTarget = protector;
		}

		// Add target
		(activate_step as SkillActivateStep).targets.push({ tid: realTarget.id });

		attackTarget(fightData, fighter, realTarget, false, element_attack, skill, activate_step);

		// TODO this moveBack should be after the activate step
		if (protector && protector.hp > 0) {
			// Add moveBack step
			fightData.steps.push({
				action: 'moveBack',
				fid: realTarget.id
			});
		}
	});

	// Add step
	fightData.steps.push(activate_step);
};

const createMonster = (fightData: DetailedFight, fighter: DetailedFighter, monsterData: MonsterFiche) => {
	// Count monsters
	const monsterCount = fightData.fighters.filter(f => f.type !== 'dinoz').length;

	// Count monsters with M_RENFORT
	const renfortApplied = fightData.fighters.filter(f => f.skills.some(skill => skill.id === Skill.M_RENFORTS)).length;

	// Count monsters with M_WORM_CALL
	const wormCalls = fightData.fighters.filter(f => f.skills.some(skill => skill.id === Skill.M_WORM_CALL)).length;

	// Initialize monster
	const monster = initializeMonster(
		{ existingMonsters: monsterCount, renfortApplied, wormCalls },
		null,
		fighter.attacker ? 0 : 1,
		monsterData,
		fightData.place,
		true,
		fightData.rng
	);

	monster.master = fighter.id;

	// Adjust time
	monster.time = fighter.time + randomBetweenMaxExcludedSeeded(fightData.rng, 0, TIME_BASE) * TIME_FACTOR;

	// Add monster to fighters
	fightData.fighters.push(monster);

	// Add arrive step
	fightData.steps.push({
		action: 'arrive',
		fid: monster.id
	});

	checkInvocationBan(fightData, monster);

	return monster;
};

const checkInvocationBan = (fightData: DetailedFight, invocation: DetailedFighter) => {
	// Get fighters
	const fighters = getFighters(fightData);

	// Check if a fighter has Item.BANISHMENT
	const banisher = fighters.find(f => f.items.some(item => item.itemId === Item.BANISHMENT));

	if (!banisher) return;

	// Add item use step
	fightData.steps.push({
		action: 'itemUse',
		fighter: stepFighter(banisher),
		itemId: Item.BANISHMENT
	});

	// Add leave step
	fightData.steps.push({
		action: 'leave',
		fighter: stepFighter(invocation)
	});

	invocation.escaped = true;
};

const activateEnvironment = (fightData: DetailedFight, caster: DetailedFighter, environment: Skill) => {
	// Set environment
	fightData.environment = {
		type: environment,
		caster,
		turnsLeft: 3
	};

	// Add activate environment step
	fightData.steps.push({
		action: 'activateEnvironment',
		environment
	});

	switch (environment) {
		case Skill.AMAZONIE: {
			// Make all fighters with WOOD < 10 fall asleep
			getFighters(fightData).forEach(f => {
				if (f.stats.base[ElementType.WOOD] < 10) {
					addStatus(fightData, f, Status.ASLEEP);
				}
			});
			break;
		}
		case Skill.PAYS_DE_CENDRE: {
			// Add NO_EVENT, NO_SKILL to all fighters with FIRE < 10
			getFighters(fightData).forEach(f => {
				if (f.stats.base[ElementType.FIRE] < 10) {
					addStatus(fightData, f, Status.NO_EVENT);
					addStatus(fightData, f, Status.NO_SKILL);
				}
			});
			break;
		}
		case Skill.ABYSSE: {
			// Add WEAKENED to all fighters with WATER < 10
			getFighters(fightData).forEach(f => {
				if (f.stats.base[ElementType.WATER] < 10) {
					// TODO: this probably needs rework as it applies a nextAssaultMultiplier = 0.75
					addStatus(fightData, f, Status.WEAKENED);
				}
			});
			break;
		}
		case Skill.FEU_DE_ST_ELME: {
			// Add LIGHTNING_STRUCK to all fighters with LIGHTNING < 10
			getFighters(fightData).forEach(f => {
				if (f.stats.base[ElementType.LIGHTNING] < 10) {
					addStatus(fightData, f, Status.LIGHTNING_STRUCK);
				}
			});
			break;
		}
		case Skill.OURANOS: {
			// Add AIR_SLOWED to all fighters with AIR < 10
			getFighters(fightData).forEach(f => {
				if (f.stats.base[ElementType.AIR] < 10) {
					addStatus(fightData, f, Status.AIR_SLOWED);
				}
			});
			break;
		}
		default: {
			sendJSONToDiscord('Error `Environment ${environment} not implemented` in `activateEnvironment`.', {
				fightData: fightData,
				caster: caster,
				environment: environment
			});
			throw new Error(`Environment ${environment} not implemented`);
		}
	}
};

const cancelEnvironment = (fightData: DetailedFight) => {
	if (!fightData.environment) {
		return;
	}

	switch (fightData.environment.type) {
		case Skill.AMAZONIE: {
			// Wake up all fighters
			getFighters(fightData).forEach(f => {
				removeStatus(fightData, f, Status.ASLEEP);
			});
			break;
		}
		case Skill.PAYS_DE_CENDRE: {
			// Remove NO_EVENT, NO_SKILL from all fighters
			getFighters(fightData).forEach(f => {
				removeStatus(fightData, f, Status.NO_EVENT, Status.NO_SKILL);
			});
			break;
		}
		case Skill.ABYSSE: {
			// Remove WEAKENED from all fighters
			getFighters(fightData).forEach(f => {
				removeStatus(fightData, f, Status.WEAKENED);
			});
			break;
		}
		case Skill.FEU_DE_ST_ELME: {
			// Remove LIGHTNING_STRUCK from all fighters
			getFighters(fightData).forEach(f => {
				removeStatus(fightData, f, Status.LIGHTNING_STRUCK);
			});
			break;
		}
		case Skill.OURANOS: {
			// Remove AIR_SLOWED from all fighters
			getFighters(fightData).forEach(f => {
				removeStatus(fightData, f, Status.AIR_SLOWED);
			});
			break;
		}
		default:
			console.warn('Unknown environment', fightData.environment.type);
			break;
	}

	// Add expire environment step
	fightData.steps.push({
		action: 'expireEnvironment',
		environment: fightData.environment.type
	});

	fightData.environment = undefined;
};

const activateEvent = (fightData: DetailedFight, event: SkillDetails | ItemFiche): boolean => {
	// Get current fighter
	const fighter = fightData.fighters[0];

	// Cancel method to use if the item ends up not being triggered
	const cancel = () => {
		// Remove last step
		fightData.steps.pop();

		return false;
	};

	// If event is a skill
	if ('id' in event) {
		const activate_step: SkillActivateStep = {
			action: 'skillActivate',
			fid: fighter.id,
			skill: event.id,
			targets: []
		};

		// Add skillAnnounce step, capture the index
		fightData.steps.push({ action: 'skillAnnounce', fid: fighter.id, skill: event.id });

		switch (event.id) {
			// AIR Vanilla
			case Skill.VENT_VIF: {
				addStatus(fightData, fighter, Status.QUICKENED, StatusLength.SHORT);
				break;
			}
			case Skill.AIGUILLON: {
				attackSingleOpponent(
					fightData,
					fighter,
					getElementalAttack(fighter, ElementType.AIR, 3),
					event.id,
					activate_step
				);
				break;
			}
			// FIRE
			case Skill.COMBUSTION:
				const opponents = getOpponents(fightData, fighter);
				opponents.forEach(opponent => {
					loseHpBalanced(fightData, opponent, opponent.stats.base[ElementType.WOOD], LifeEffect.Fire);
				});
				break;
			case Skill.BRASERO: {
				attackAllOpponents(
					fightData,
					fighter,
					getElementalAttack(fighter, ElementType.FIRE, 3),
					event.id,
					activate_step
				);
				break;
			}
			case Skill.COLERE: {
				fighter.nextAssaultMultiplier *= 1.25;
				// Add step for fx
				fightData.steps.push(activate_step);
				break;
			}
			case Skill.DETONATION: {
				// The fighter will not suicide with the skill, it just loses its roll
				if (fighter.hp > 5) {
					// Add step for fx
					fightData.steps.push(activate_step);
					loseHp(fightData, fighter, 5, LifeEffect.Burn);
					// Increase the time of all other fighters to make it look like the caster "gained" time
					getFighters(fightData).forEach(f => {
						if (f.id !== fighter.id) {
							f.time += 15 * TIME_FACTOR;
						}
					});
					// Add fx for gain of init
					fightData.steps.push({
						action: 'notify',
						fids: [fighter.id],
						notification: NotificationList.InitUp
					});
				} else {
					return cancel();
				}
				break;
			}
			// LIGHTNING
			case Skill.AURA_HERMETIQUE: {
				addStatus(fightData, fighter, Status.SHIELDED);
				break;
			}
			case Skill.BENEDICTION: {
				getAllies(fightData, fighter).forEach(fighter => {
					addStatus(fightData, fighter, Status.BLESSED, StatusLength.MEDIUM);
				});
				break;
			}
			case Skill.FOCUS: {
				fighter.nextAssaultBonus += fighter.stats.base[ElementType.LIGHTNING];
				// Add step for fx
				fightData.steps.push(activate_step);
				break;
			}
			case Skill.PUREE_SALVATRICE: {
				// Add step for fx
				fightData.steps.push(activate_step);
				// Remove all the bad status of the group
				getAllies(fightData, fighter).forEach(fighter => {
					removeStatus(fightData, fighter, ...fighter.status.filter(s => BadStatus.includes(s.type)).map(s => s.type));
				});
				break;
			}
			// WATER
			case Skill.DOUCHE_ECOSSAISE: {
				attackAllOpponents(
					fightData,
					fighter,
					getElementalAttack(fighter, ElementType.WATER, 2),
					event.id,
					activate_step
				);
				break;
			}
			case Skill.MARECAGE: {
				// Add step for fx
				fightData.steps.push(activate_step);

				const opponents = getOpponents(fightData, fighter);

				// Slow opponents
				opponents.forEach(opponent => {
					addStatus(fightData, opponent, Status.SLOWED, StatusLength.MEDIUM);
				});
				break;
			}
			case Skill.CLONE_AQUEUX: {
				const initialDinoz = fightData.initialDinozList.find(d => d.id === fighter.id);

				if (!initialDinoz) {
					sendJSONToDiscord('Error `No initial dinoz found` in `activateEvent`.', {
						fightData: fightData,
						event: event
					});
					throw new Error('No initial dinoz found');
				}

				// Count monsters
				const clone = cloneDinoz(fighter, fightData);

				// Add clone to fighters
				fightData.fighters.push(clone);

				// Add arrive step
				fightData.steps.push({
					action: 'arrive',
					fid: clone.id
				});

				checkInvocationBan(fightData, clone);
				break;
			}
			case Skill.DIETE_CHROMATIQUE: {
				// Pick a random opponent (no filtering is applied intentionally)
				const opponents = getOpponents(fightData, fighter);
				const opponent = opponents[randomBetweenSeeded(fightData.rng, 0, opponents.length - 1)];

				// Lock that opponent to a random element
				opponent.element = opponent.elements[Math.round(fightData.rng() * opponent.elements.length)];
				addStatus(fightData, opponent, Status.LOCKED, StatusLength.MEDIUM);
				break;
			}
			case Skill.HYPERVENTILATION: {
				// Add step for fx
				fightData.steps.push(activate_step);

				const opponents = getOpponents(fightData, fighter);

				opponents.forEach(opponent => {
					// Reduce max energy by 20%
					const newMaxEnergy = Math.round(opponent.maxEnergy * 0.8);

					// Cancel if no change
					if (newMaxEnergy === opponent.maxEnergy) {
						return cancel();
					}

					setMaxEnergy(opponent, newMaxEnergy);

					// Add reduce energy step
					fightData.steps.push({
						action: 'reduceEnergy',
						fighter: stepFighter(opponent)
					});
				});
				break;
			}
			// WOOD
			case Skill.RENFORTS_KORGON: {
				createMonster(fightData, fighter, monsterList.KORGON_REINFORCEMENT);
				break;
			}
			case Skill.VIGNES: {
				// Get random opponent
				const opponent = getRandomOpponent(fightData, fighter);

				// Add target
				activate_step.targets.push({ tid: opponent.id });

				if (!hasStatus(opponent, Status.FLYING)) {
					// Increase the opponent's time
					opponent.time += 15 * TIME_FACTOR;
					// Add fx for loss of init
					fightData.steps.push({
						action: 'notify',
						fids: [opponent.id],
						notification: NotificationList.InitDown
					});
				}

				// Add step for fx
				fightData.steps.push(activate_step);
				break;
			}
			case Skill.RESISTANCE_A_LA_MAGIE: {
				// Add step for fx
				fightData.steps.push(activate_step);
				// Remove all bad status
				removeStatus(fightData, fighter, ...fighter.status.filter(s => BadStatus.includes(s.type)).map(s => s.type));
				break;
			}
			case Skill.ETAT_PRIMAL: {
				// Add step for fx
				fightData.steps.push(activate_step);
				getFighters(fightData).forEach(f => {
					// Remove team bad status
					if (f.attacker === fighter.attacker) {
						removeStatus(fightData, f, ...f.status.filter(s => BadStatus.includes(s.type)).map(s => s.type));
					} else {
						// Remove opponent team good status
						removeStatus(fightData, f, ...f.status.filter(s => GoodStatus.includes(s.type)).map(s => s.type));
					}
				});
				break;
			}
			case Skill.GROSSE_BEIGNE: {
				// Add step for fx
				fightData.steps.push(activate_step);
				fighter.nextAssaultMultiplier *= 2;
				break;
			}
			case Skill.PRINTEMPS_PRECOCE: {
				// Heal all allies
				getAllies(fightData, fighter).forEach(f => {
					// Skip self
					if (f.id === fighter.id) return;

					// Heal 1-wood HP
					heal(
						fightData,
						f,
						randomBetweenSeeded(fightData.rng, 1, fighter.stats.base[ElementType.WOOD]),
						activate_step
					);
				});

				// Add step
				fightData.steps.push(activate_step);
				break;
			}
			case Skill.ESPRIT_GORILLOZ: {
				const monster = createMonster(fightData, fighter, monsterList.GORILLOZ_SPIRIT);

				// Set intangible
				addStatus(fightData, monster, Status.INTANGIBLE);
				break;
			}
			case Skill.PAYS_DE_CENDRE: {
				// Only one environment active at a time
				if (fightData.environment) {
					return cancel();
				}

				activateEnvironment(fightData, fighter, Skill.PAYS_DE_CENDRE);
				break;
			}
			case Skill.BOUCLIER_DINOZ: {
				// Get allies dinoz
				const allies = getAllies(fightData, fighter, ['dinoz']);

				if (allies.length < 2) {
					return cancel();
				}

				// Get lowest HP ally
				const lowestHpAlly = allies.reduce(
					(acc, ally) => {
						if (ally.id !== fighter.id && (!acc || ally.hp < acc.hp)) {
							return ally;
						}

						return acc;
					},
					null as DetailedFighter | null
				);

				if (!lowestHpAlly) {
					sendJSONToDiscord('Error `No lowest HP ally found` in `activateEvent`.', {
						fightData: fightData,
						event: event
					});
					throw new Error('No lowest HP ally found');
				}

				// Nothing happens if the target is already protected
				if (fightData.protectedFighters.find(id => id === lowestHpAlly.id)) {
					break;
				} else {
					fightData.protectedFighters.push(lowestHpAlly.id);
				}

				// Add fx for shielded target
				fightData.steps.push({
					action: 'notify',
					fids: [lowestHpAlly.id],
					notification: NotificationList.InitDown
				});
				// Protect lowest HP ally
				fighter.protecting = lowestHpAlly.id;
				break;
			}
			case Skill.COURBATURES: {
				const opponent = getRandomOpponent(fightData, fighter);

				// Add target
				activate_step.targets.push({ tid: opponent.id });

				// Reduce max energy by 30%
				const newMaxEnergy = Math.round(opponent.maxEnergy * 0.7);

				// Cancel if no change
				if (newMaxEnergy === opponent.maxEnergy) {
					return cancel();
				}

				setMaxEnergy(opponent, newMaxEnergy);

				// Add reduce energy step
				fightData.steps.push({
					action: 'reduceEnergy',
					fighter: stepFighter(opponent)
				});
				// TODO need step to add endurance off effect
				break;
			}
			case Skill.BERSERK: {
				// Remove all skills and events
				fighter.skills = [];
				fighter.items = [];

				// TODO need step to add blink effect (or tie it to berzerk)

				fighter.allAssaultMultiplier = 2;

				break;
			}
			case Skill.BANNI_DES_DIEUX: {
				// Get random opponent
				const opponent = getRandomOpponent(fightData, fighter);

				// Add target
				activate_step.targets.push({ tid: opponent.id });

				// Disable invocations
				// TODO: see if this can be done differently as this may mess up with display
				addStatus(fightData, opponent, Status.NO_INVOCATION);

				// Add step for fx
				fightData.steps.push({
					action: 'notify',
					fids: [opponent.id],
					notification: NotificationList.Silence
				});
				break;
			}
			case Skill.THERAPIE_DE_GROUPE: {
				// TODO the effect needs to start next turn
				addStatus(fightData, fighter, Status.COPY_HEAL);
				break;
			}
			case Skill.MORSURE_DU_SOLEIL: {
				// Get random opponent
				const opponent = getRandomOpponent(fightData, fighter);

				// Add target
				activate_step.targets.push({ tid: opponent.id });

				addStatus(fightData, opponent, Status.DAZZLED, StatusLength.MEDIUM);
				break;
			}
			case Skill.CRAMPE_CHRONIQUE: {
				setEnergy(fighter, fighter.energy - 10);
				fighter.stats.special.energyRecovery *= 0.85;

				// Add reduce energy step
				fightData.steps.push({
					action: 'reduceEnergy',
					fighter: stepFighter(fighter)
				});
				// Add step for fx
				fightData.steps.push({
					action: 'notify',
					fids: [fighter.id],
					notification: NotificationList.Down
				});
				break;
			}
			case Skill.MAINS_COLLANTES: {
				// Get random opponent
				const opponent = getRandomOpponent(fightData, fighter);

				// Add target
				activate_step.targets.push({ tid: opponent.id });

				// Check if NO_DODGE
				if (hasStatus(opponent, Status.NO_DODGE)) {
					return cancel();
				}

				// Add status
				addStatus(fightData, opponent, Status.NO_DODGE);
				break;
			}
			case Skill.MUTINERIE: {
				// Get clones
				const clones = getFighters(fightData, ['clone']);

				// Cancel if no clones
				if (!clones.length) {
					return cancel();
				}

				clones.forEach(clone => {
					// TODO add effect
					// Change team
					clone.attacker = !clone.attacker;
				});
				break;
			}
			case Skill.FRENESIE_COLLECTIVE: {
				// Add step for fx
				fightData.steps.push(activate_step);
				// TODO add speed effect on all allies
				getAllies(fightData, fighter).forEach(ally => {
					addStatus(fightData, ally, Status.QUICKENED, StatusLength.MEDIUM);
					activate_step.targets.push({ tid: ally.id });
				});
				break;
			}
			// MONSTER
			case Skill.M_REGENERATION: {
				if (fighter.hp >= fighter.startingHp) {
					return cancel();
				}

				heal(fightData, fighter, Math.round(fighter.startingHp * 0.1), undefined, LifeEffect.Heal);
				break;
			}
			case Skill.M_IMMATERIAL: {
				if (hasStatus(fighter, Status.INTANGIBLE)) {
					return cancel();
				}

				addStatus(fightData, fighter, Status.INTANGIBLE, StatusLength.SHORT);
				break;
			}
			case Skill.M_ELEMENTAL: {
				// Lock into a random element
				let randomElement = randomBetweenSeeded(fightData.rng, 1, 6) as ElementType;

				while (fighter.element === randomElement) {
					randomElement = randomBetweenSeeded(fightData.rng, 1, 6) as ElementType;
				}

				fighter.element = randomElement;
				fighter.elements = [randomElement];
				break;
			}
			case Skill.M_YAKUZI: {
				const clone = createMonster(fightData, fighter, bossList.YAKUZI);

				// Count monsters
				const monsterCount = fightData.fighters.filter(f => f.type !== 'dinoz').length;

				clone.level = 1;
				clone.hp = 1;
				clone.type = 'clone';
				clone.master = fighter.id;
				clone.id = -monsterCount - 1;

				applyStrategy(fightData, clone);

				// Set the clone's time to the fighter's time
				clone.time = fighter.time;

				// Add clone to fighters
				fightData.fighters.push(clone);

				// Add arrive step
				fightData.steps.push({
					action: 'arrive',
					fid: clone.id
				});

				checkInvocationBan(fightData, clone);
				break;
			}
			case Skill.M_CURSED_WAND: {
				// TODO rework
				// // Get all opponent dinoz
				// const opponents = getOpponents(fightData, fighter, ['dinoz']);

				// attackMultipleOpponents(fightData, fighter, opponents, event, step);
				break;
			}
			case Skill.M_HEAL_GROUP: {
				// TODO remove announcement of skill
				getAllies(fightData, fighter).forEach(ally => {
					// Heal 1 HP
					heal(fightData, ally, 1, undefined, LifeEffect.Heal);
				});

				// Get dead allies
				const deadAllies = fightData.fighters.filter(f => f.attacker === fighter.attacker && f.hp <= 0);

				// Revive all dead allies
				deadAllies.forEach(ally => {
					// Reset HP to 0 in case it was negative
					ally.hp = 0;
					// TODO swap for resurrect method
					heal(fightData, ally, 1, undefined, LifeEffect.Heal);

					// Probably useless
					// // Add revive step
					// fightData.steps.push({
					// 	action: 'revive',
					// 	fighter: stepFighter(ally)
					// });
				});
				break;
			}
			case Skill.M_UNTOUCHABLE: {
				const tangibleAllies = getAllies(fightData, fighter).filter(f => !hasStatus(f, Status.INTANGIBLE));

				if (!tangibleAllies.length) {
					return cancel();
				}

				// Get random ally
				const ally = tangibleAllies[randomBetweenSeeded(fightData.rng, 0, tangibleAllies.length - 1)];

				// Add status
				addStatus(fightData, ally, Status.INTANGIBLE, StatusLength.MEDIUM);
				break;
			}
			case Skill.M_FASTER: {
				getAllies(fightData, fighter).forEach(ally => {
					// Add to targets
					activate_step.targets.push({ tid: ally.id });

					ally.time -= 5 * TIME_FACTOR;
					fighter.time += 3 * TIME_FACTOR;
				});
				break;
			}
			case Skill.M_FRUKOPTER_FLIGHT: {
				// Get non flying allies
				const nonFlyingAllies = getAllies(fightData, fighter).filter(f => !hasStatus(f, Status.FLYING));

				if (!nonFlyingAllies.length) {
					return cancel();
				}

				// Get random ally
				const ally = nonFlyingAllies[randomBetweenSeeded(fightData.rng, 0, nonFlyingAllies.length - 1)];

				// Add status
				addStatus(fightData, ally, Status.FLYING);
				break;
			}
			default:
				// Remove last step
				fightData.steps.pop();

				return false;
		}

		// Not working well to add the activate step for all skills at this point
		// // Add step
		// fightData.steps.push(activate_step);

		// Consume energy
		setEnergy(fighter, fighter.energy - event.energy);
	} else {
		// Event is an item

		// Add item use step
		fightData.steps.push({
			action: 'itemUse',
			fighter: stepFighter(fighter),
			itemId: event.itemId
		});

		switch (event.itemId) {
			case Item.CLOUD_BURGER: {
				// Cancel if HP requirement not met
				if (fighter.hp === fighter.startingHp || (fighter.hp > 15 && fighter.startingHp - fighter.hp < 10)) {
					return cancel();
				}

				// Heal 10 HP
				heal(fightData, fighter, 10, undefined, LifeEffect.Object, true);
				break;
			}
			case Item.FIGHT_RATION: {
				let hpDelta = 20 - (fighter.startingHp - fighter.hp);

				if (hpDelta < 0) hpDelta = 0;

				// Less chance to heal if lost HP is less than 20. Sure to heal if lost HP is 20+
				if (fighter.hp === fighter.startingHp || randomBetweenSeeded(fightData.rng, 0, hpDelta) !== 0) {
					return cancel();
				}

				// Heal 20 HP
				heal(fightData, fighter, 20, undefined, LifeEffect.Object, true);
				break;
			}
			case Item.SOS_HELMET: {
				fighter.stats.special.armor += 1;
				break;
			}
			case Item.PAMPLEBOUM_PIT:
			case Item.LITTLE_PEPPER: {
				fighter.nextAssaultBonus += 10;
				break;
			}
			case Item.ZIPPO: {
				addStatus(fightData, fighter, Status.TORCHED, StatusLength.LONG);
				break;
			}
			case Item.SOS_FLAME: {
				createMonster(fightData, fighter, monsterList.FLAM);
				break;
			}
			case Item.REFRIGERATED_SHIELD: {
				fighter.stats.defense[ElementType.FIRE] += 10;
				break;
			}
			case Item.GOBLIN_MERGUEZ: {
				// Cancel if no HP lost
				if (fighter.hp === fighter.startingHp) {
					return cancel();
				}

				// -10% all defenses
				fighter.stats.defense[ElementType.FIRE] -= fighter.stats.defense[ElementType.FIRE] * 0.1;
				fighter.stats.defense[ElementType.WATER] -= fighter.stats.defense[ElementType.WATER] * 0.1;
				fighter.stats.defense[ElementType.WOOD] -= fighter.stats.defense[ElementType.WOOD] * 0.1;
				fighter.stats.defense[ElementType.LIGHTNING] -= fighter.stats.defense[ElementType.LIGHTNING] * 0.1;
				fighter.stats.defense[ElementType.AIR] -= fighter.stats.defense[ElementType.AIR] * 0.1;
				fighter.stats.defense[ElementType.VOID] -= fighter.stats.defense[ElementType.VOID] * 0.1;

				// Regen 1-4 HP (weighted)
				const data = [
					{ hp: 0, odds: 10 },
					{ hp: 1, odds: 7 },
					{ hp: 2, odds: 5 },
					{ hp: 3, odds: 3 }
				];
				const total = data.reduce((acc, item) => acc + item.odds, 0);
				const item = weightedRandom(data, total); // { id: X, odds: Y }
				heal(fightData, fighter, 1 + item.hp, undefined, LifeEffect.Normal, true);
				break;
			}
			case Item.PORTABLE_LOVE: {
				// Check if an opponent is flying
				const opponent = getOpponents(fightData, fighter).find(f => hasStatus(f, Status.FLYING));

				if (!opponent) {
					return cancel();
				}

				fighter.canHitFlying = true;
				break;
			}
			case Item.MONOCHROMATIC: {
				// Check if an opponent has an Antichromatic
				const opponent = getOpponents(fightData, fighter).find(f =>
					f.items.some(item => item.itemId === Item.ANTICHROMATIC)
				);

				// Don't cancel, just don't apply the effect and trigger the ANTICHROMATIC
				if (opponent) {
					// Add item use step
					fightData.steps.push({
						action: 'itemUse',
						fighter: stepFighter(opponent),
						itemId: Item.ANTICHROMATIC
					});
					break;
				}

				// Get dinoz best element
				const bestElement = fighter.elements.reduce((acc, element) => {
					if (fighter.stats.base[element] > fighter.stats.base[acc]) {
						return element;
					}

					return acc;
				}, ElementType.FIRE);

				// Set element
				fighter.element = bestElement;

				// Set the element list to only the best element
				fighter.elements = [bestElement];
				break;
			}
			case Item.FUCA_PILL: {
				// Check if another FUCA was already used
				if (fighter.itemsUsed.includes(Item.FUCA_PILL)) {
					return cancel();
				}

				// Cancel if speed is already x2
				if (fighter.stats.speed.global <= 0.5) {
					return cancel();
				}

				// Increase speed
				fighter.stats.speed.global *= 0.75;
				break;
			}
			case Item.LORIS_COSTUME: {
				// Get opponents
				const opponents = getOpponents(fightData, fighter);

				// Cancel if less than 2 opponents
				if (opponents.length < 2) {
					return cancel();
				}

				// Cancel if petrifed or stunned
				if (hasStatus(fighter, Status.PETRIFIED) || hasStatus(fighter, Status.STUNNED)) {
					return cancel();
				}

				// Get random opponent attacker
				const opponentAttacker = getRandomOpponent(fightData, fighter);

				// Get other opponents
				const opponentsWithoutAttacker = opponents.filter(opponent => opponent.id !== opponentAttacker.id);

				// Get random opponent defender
				const opponentDefender =
					opponentsWithoutAttacker[randomBetweenSeeded(fightData.rng, 0, opponentsWithoutAttacker.length - 1)];

				// Add moveTo step
				fightData.steps.push({
					action: 'moveTo',
					fid: opponentAttacker.id,
					tid: opponentDefender.id
				});

				// Attack defender
				attackTarget(fightData, opponentAttacker, opponentDefender, false);

				// Check if fighter is not dead
				if (opponentAttacker.hp > 0) {
					// Add moveBack step
					fightData.steps.push({
						action: 'moveBack',
						fid: opponentAttacker.id
					});
				}
				break;
			}
			case Item.STRONG_TEA: {
				// Get allies
				const allies = getAllies(fightData, fighter);

				// Check if the team has BEER status
				const hasBeer = allies.some(f => hasStatus(f, Status.BEER));

				if (!hasBeer) {
					return cancel();
				}

				// Remove BEER status
				allies.forEach(f => {
					removeStatus(fightData, f, Status.BEER);
				});
				break;
			}
			case Item.PIRHANOZ_IN_BAG: {
				createMonster(fightData, fighter, monsterList.PIRA);
				break;
			}
			case Item.AMAZON: {
				// Only one environment active at a time
				if (fightData.environment) {
					return cancel();
				}

				activateEnvironment(fightData, fighter, Skill.AMAZONIE);
				break;
			}
			case Item.LAND_OF_ASHES: {
				// Only one environment active at a time
				if (fightData.environment) {
					return cancel();
				}

				activateEnvironment(fightData, fighter, Skill.PAYS_DE_CENDRE);
				break;
			}
			case Item.ABYSS: {
				// Only one environment active at a time
				if (fightData.environment) {
					return cancel();
				}

				activateEnvironment(fightData, fighter, Skill.ABYSSE);
				break;
			}
			case Item.ST_ELMAS_FIRE: {
				// Only one environment active at a time
				if (fightData.environment) {
					return cancel();
				}

				activateEnvironment(fightData, fighter, Skill.FEU_DE_ST_ELME);
				break;
			}
			case Item.UVAVU: {
				// Only one environment active at a time
				if (fightData.environment) {
					return cancel();
				}

				activateEnvironment(fightData, fighter, Skill.OURANOS);
				break;
			}
			case Item.SURVIVING_RATION: {
				let hpDelta = Math.round((50 - (fighter.startingHp - fighter.hp)) / 10);

				if (hpDelta < 0) hpDelta = 0;

				// Less chance to heal if lost HP is less than 50. Sure to heal if lost HP is 50+
				if (fighter.hp === fighter.startingHp || randomBetweenSeeded(fightData.rng, 0, hpDelta) !== 0) {
					return cancel();
				}

				// Heal 40 HP
				heal(fightData, fighter, 40, undefined, LifeEffect.Object, true);
				break;
			}
			default:
				console.warn('Unknown item', event.itemId);
				return cancel();
		}

		// Add to items used
		fighter.itemsUsed.push(event.itemId);

		// Get item index
		const itemIndex = fighter.items.findIndex(item => item.itemId === event.itemId);

		// Remove from items
		fighter.items.splice(itemIndex, 1);
	}

	if ('id' in event && fighter.type !== 'boss') {
		// Get opponents with SHARIGNAN
		const opponentsWithSharingan = getOpponents(fightData, fighter).filter(opponent =>
			opponent.skills.some(skill => skill.id === Skill.SHARIGNAN)
		);

		opponentsWithSharingan.forEach(opponent => {
			// Abort if opponent already has the skill
			if (opponent.skills.some(skill => skill.id === event.id)) return;

			// 20% chance to copy the skill
			const random = fightData.rng();

			if (random < 0.2) {
				// Add skillActivate step
				fightData.steps.push({
					action: 'skillActivate',
					fid: opponent.id,
					skill: Skill.SHARIGNAN,
					targets: []
				});

				// Add skill to opponent
				opponent.skills.push({ ...event });
			}
		});
	}

	return true;
};

export const createStatus = (type: Status, length?: number): FighterStatus => {
	let cycle = false;

	switch (type) {
		case Status.TORCHED:
		case Status.BURNED:
		case Status.POISONED:
		case Status.HEALING: {
			cycle = true;
			break;
		}
		default: {
			break;
		}
	}

	return {
		type,
		time: (length ?? StatusLength.INFINITE) * TIME_FACTOR,
		timeSinceLastCycle: 0,
		cycle
	};
};

export const hasStatus = (fighter: DetailedFighter, status: Status) => fighter.status.some(s => s.type === status);

export const addStatus = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	status: Status,
	length?: StatusLength
) => {
	// Check if fighter already has the status
	if (hasStatus(fighter, status)) return;

	// Bad status
	const isBad = BadStatus.includes(status);

	// Negate if SELF_CONTROL
	if (isBad && fighter.skills.find(skill => skill.id === Skill.SELF_CONTROL)) return;

	// Handle the immediate effect of the status
	switch (status) {
		case Status.AIR_SLOWED: {
			fighter.stats.speed.global *= 2;
			break;
		}
		case Status.ASLEEP: {
			fighter.time += FIGHT_INFINITE;
			break;
		}
		case Status.TORCHED: {
			fighter.stats.defense[ElementType.FIRE] += 10;
			break;
		}
		case Status.SLOWED: {
			fighter.stats.speed.global *= 1.5;
			break;
		}
		case Status.QUICKENED: {
			fighter.stats.speed.global /= 1.5;
			break;
		}
		case Status.PETRIFIED: {
			fighter.stats.special.armor += 5;
			fighter.time += FIGHT_INFINITE;
			break;
		}
		case Status.SHIELDED: {
			fighter.stats.special.armor += 5;
			break;
		}
		case Status.BLESSED: {
			fighter.stats.assaultBonus[ElementType.AIR] += 3;
			fighter.stats.assaultBonus[ElementType.FIRE] += 3;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 3;
			fighter.stats.assaultBonus[ElementType.WATER] += 3;
			fighter.stats.assaultBonus[ElementType.WOOD] += 3;
			break;
		}
		case Status.STUNNED: {
			fighter.time += FIGHT_INFINITE;
		}
		default: {
			break;
		}
	}

	// Add status
	fighter.status.push(createStatus(status, length ?? StatusLength.INFINITE));

	// Add status step
	fightData.steps.push({
		action: 'addStatus',
		fighter: stepFighter(fighter),
		status
	});

	// Petrified stat
	if (status === Status.PETRIFIED) {
		updateStat(fightData, fighter, 'petrified', 1);
	}
};

const removeStatus = (fightData: DetailedFight, fighter: DetailedFighter, ...statusList: Status[]) => {
	statusList.forEach(status => {
		// Check if fighter has the status
		if (!hasStatus(fighter, status)) return;

		// Dont' wake up if M_DISABLE
		if (status === Status.ASLEEP && fighter.skills.some(skill => skill.id === Skill.M_DISABLE)) {
			return;
		}

		// Add status step
		fightData.steps.push({
			action: 'removeStatus',
			fighter: stepFighter(fighter),
			status
		});

		// Reverse the effect of the status
		switch (status) {
			case Status.AIR_SLOWED: {
				fighter.stats.speed.global /= 2;
				break;
			}
			case Status.ASLEEP: {
				fighter.time = fightData.time + randomBetweenSeeded(fightData.rng, 0, TIME_BASE * TIME_FACTOR);
				break;
			}
			case Status.TORCHED: {
				fighter.stats.defense[ElementType.FIRE] -= 10;
				break;
			}
			case Status.SLOWED: {
				fighter.stats.speed.global /= 1.5;
				break;
			}
			case Status.QUICKENED: {
				fighter.stats.speed.global *= 1.5;
				break;
			}
			case Status.PETRIFIED: {
				fighter.stats.special.armor -= 5;
				fighter.time -= FIGHT_INFINITE;
				// Make sure the fighter's time is not in the past
				if (fighter.time < fightData.time) {
					fighter.time = fightData.time;
				}
				break;
			}
			case Status.SHIELDED: {
				fighter.stats.special.armor -= 5;
				break;
			}
			case Status.BLESSED: {
				fighter.stats.assaultBonus[ElementType.AIR] -= 3;
				fighter.stats.assaultBonus[ElementType.FIRE] -= 3;
				fighter.stats.assaultBonus[ElementType.LIGHTNING] -= 3;
				fighter.stats.assaultBonus[ElementType.WATER] -= 3;
				fighter.stats.assaultBonus[ElementType.WOOD] -= 3;
				break;
			}
			case Status.STUNNED: {
				fighter.time -= FIGHT_INFINITE;
				// Make sure the fighter's time is not in the past
				if (fighter.time < fightData.time) {
					fighter.time = fightData.time;
				}
			}
			default: {
				break;
			}
		}
	});

	// Remove status
	fighter.status = fighter.status.filter(s => !statusList.includes(s.type));
};

const activateSkill = (fightData: DetailedFight, skill: SkillDetails): boolean => {
	// Get current fighter
	const fighter = fightData.fighters[0];

	const activate_step: SkillActivateStep = {
		action: 'skillActivate',
		fid: fighter.id,
		skill: skill.id,
		targets: []
	};

	// Add announce step
	fightData.steps.push({
		action: 'skillAnnounce',
		fid: fighter.id,
		skill: skill.id
	});

	// Cancel method to use if the skil ends up not being triggered
	const cancel = () => {
		// Remove last step
		fightData.steps.pop();

		return false;
	};

	switch (skill.id) {
		// AIR
		case Skill.MISTRAL:
			attackAllOpponents(fightData, fighter, getElementalAttack(fighter, ElementType.AIR, 3), skill.id, activate_step);
			break;
		case Skill.DISQUE_VACUUM:
			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.AIR, 12),
				skill.id,
				activate_step
			);
			break;
		case Skill.ENVOL: {
			// Attack opponent
			launchAssault(fightData, fighter, true, skill.id);

			// Fighter starts flying if not dead after the assault
			if (fighter.hp > 0) {
				addStatus(fightData, fighter, Status.FLYING);
			}
			break;
		}
		case Skill.TORNADE: {
			getOpponents(fightData, fighter).forEach(opponent => {
				// Cancel FLYING
				removeStatus(fightData, opponent, Status.FLYING);
			});

			attackAllOpponents(fightData, fighter, getElementalAttack(fighter, ElementType.AIR, 10), skill.id, activate_step);
			break;
		}
		case Skill.ATTAQUE_PLONGEANTE: {
			fighter.nextAssaultBonus += 2 * fighter.stats.base[ElementType.AIR];

			// Attack opponent
			launchAssault(fightData, fighter, true, Skill.ATTAQUE_PLONGEANTE);
			break;
		}
		case Skill.NUAGE_TOXIQUE: {
			// Add step for fx
			fightData.steps.push(activate_step);
			getOpponents(fightData, fighter).forEach(opponent => {
				// Poison
				poison(fightData, opponent, fighter, Skill.NUAGE_TOXIQUE, StatusLength.MEDIUM);
			});
			break;
		}
		case Skill.PAUME_EJECTABLE: {
			// x2 damage
			fighter.nextAssaultMultiplier *= 2;

			// Attack opponent
			const hit = launchAssault(fightData, fighter, true, Skill.PAUME_EJECTABLE);

			if (hit && hit.hpLost > 0) {
				// Increase time
				fighter.time += 15 * TIME_FACTOR;
				// Add fx for loss of init
				fightData.steps.push({
					action: 'notify',
					fids: [fighter.id],
					notification: NotificationList.InitDown
				});
			}
			break;
		}
		case Skill.TROU_NOIR: {
			// TODO add rule to disable escape in fight (dojo, other)

			const opponent = getRandomOpponent(fightData, fighter);

			// Prevent if item.ANTI_GRAVE_SUIT from target
			const opponentWithSuit = opponent.items.some(item => item.itemId === Item.ANTI_GRAVE_SUIT);

			if (opponentWithSuit) {
				// Add item use step
				fightData.steps.push({
					action: 'itemUse',
					fighter: stepFighter(opponent),
					itemId: Item.ANTI_GRAVE_SUIT
				});

				return true;
			}

			const result = attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.AIR, 0),
				skill.id,
				activate_step,
				opponent
			);

			// If the target is not a boss or the skill was not evaded, remove the opponent
			if (opponent.type !== 'boss' && !result.evasion) {
				opponent.escaped = true;
			}

			break;
		}
		case Skill.HYPNOSE: {
			// TODO: can only be used once, does not work on bosses, nor if there is a single fighter against
			// Get non boss opponents
			const opponents = getOpponents(fightData, fighter, ['dinoz', 'monster', 'clone']);

			if (!opponents.length) {
				return cancel();
			}

			// Get random opponent
			const opponent = chooseRandomOpponent(opponents, fightData.rng);

			// Prevent if some opponent has CUZCUSSIAN_MASK
			const opponentWithMask = getOpponents(fightData, fighter).find(opponent =>
				opponent.items.some(item => item.itemId === Item.CUZCUSSIAN_MASK)
			);

			if (opponentWithMask) {
				// Add item use step
				fightData.steps.push({
					action: 'itemUse',
					fighter: stepFighter(opponentWithMask),
					itemId: Item.CUZCUSSIAN_MASK
				});

				// Add hypnotize step
				fightData.steps.push({
					action: 'endHypnosis',
					fighter: stepFighter(opponent)
				});
			} else {
				// Hypnotized for 3 turns
				opponent.hypnotized = 4;

				// Change team
				opponent.attacker = !opponent.attacker;

				// Add hypnotize step
				fightData.steps.push({
					action: 'hypnotize',
					fighter: stepFighter(opponent)
				});
			}
		}

		// FIRE Vanila
		case Skill.SOUFFLE_ARDENT:
			attackAllOpponents(fightData, fighter, getElementalAttack(fighter, ElementType.FIRE, 5), skill.id, activate_step);
			break;
		case Skill.METEORES:
			attackAllOpponents(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.FIRE, 10),
				skill.id,
				activate_step
			);
			break;
		case Skill.CREPUSCULE_FLAMBOYANT:
			attackAllOpponents(
				fightData,
				fighter,
				getMultiElementalAttack(fighter, [
					[ElementType.FIRE, 6],
					[ElementType.LIGHTNING, 6]
				]),
				skill.id,
				activate_step
			);
			break;
		case Skill.BOULE_DE_FEU:
			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.FIRE, 7),
				skill.id,
				activate_step
			);
			break;
		case Skill.COULEE_DE_LAVE:
			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.FIRE, 12),
				skill.id,
				activate_step
			);
			break;
		case Skill.PAUME_CHALUMEAU: {
			// Increase time of the attacker
			fighter.time += 15 * TIME_FACTOR;
			// This skill cannot combo but is an assault
			launchAssault(
				fightData,
				fighter,
				false,
				Skill.PAUME_CHALUMEAU,
				getElementalAttack(fighter, ElementType.FIRE, 10)
			);
			// Add fx for loss of init
			fightData.steps.push({
				action: 'notify',
				fids: [fighter.id],
				notification: NotificationList.InitDown
			});
			break;
		}
		case Skill.KAMIKAZE: {
			// This skill cannot combo but is an assault
			launchAssault(fightData, fighter, false, Skill.KAMIKAZE, getElementalAttack(fighter, ElementType.FIRE, 15));

			// Loose 50% HP
			loseHp(fightData, fighter, Math.round(fighter.hp / 2), LifeEffect.Fire);
			break;
		}
		case Skill.SIESTE: {
			// Heal 1-20 HP
			heal(fightData, fighter, randomBetweenSeeded(fightData.rng, 1, 20), undefined, LifeEffect.Heal);

			// Fall asleep
			addStatus(fightData, fighter, Status.ASLEEP, StatusLength.SHORT);
			break;
		}

		// LIGHTNING
		case Skill.FOUDRE:
			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.LIGHTNING, 10),
				skill.id,
				activate_step
			);
			break;
		case Skill.AUBE_FEUILLUE: {
			// Heal each fighter of the caster's group
			const hpHealed = fighter.stats.base[ElementType.LIGHTNING] * 2 + fighter.stats.base[ElementType.WOOD] * 2;
			getAllies(fightData, fighter).forEach(ally => {
				heal(fightData, ally, hpHealed, activate_step);
			});
			// Add step for fx
			fightData.steps.push(activate_step);
			break;
		}
		case Skill.DANSE_FOUDROYANTE: {
			// Attack a random opponent 5 times with an lightning assault of power 3

			for (let i = 0; i < 5; i++) {
				// Get opponent for assault, the opponent can change in between the 5 hits
				const opponent = getRandomOpponentForAssault(fightData, fighter);

				if (opponent === null) {
					break;
				}

				// For this skill, the move to and move back steps are handled outside of the launchAssault method
				// Add moveTo step
				fightData.steps.push({
					action: 'moveTo',
					fid: fighter.id,
					tid: opponent.id,
					skill: Skill.DANSE_FOUDROYANTE
				});

				// Fighter attacks opponent
				launchAssault(
					fightData,
					fighter,
					true,
					Skill.DANSE_FOUDROYANTE,
					getElementalAttack(fighter, ElementType.LIGHTNING, 3),
					opponent,
					false
				);
			}

			// Add moveBack step if attacker is still alive
			if (fighter.hp > 0) {
				fightData.steps.push({
					action: 'moveBack',
					fid: fighter.id
				});
			}
			break;
		}
		case Skill.ECLAIR_SINUEUX: {
			attackAllOpponents(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.LIGHTNING, 10),
				skill.id,
				activate_step,
				undefined,
				3
			);
			break;
		}

		// WATER
		case Skill.CANON_A_EAU:
			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.WATER, 6),
				skill.id,
				activate_step
			);
			break;
		case Skill.COUP_SOURNOIS: {
			// Get random opponent
			const hit = launchAssault(fightData, fighter, true, skill.id);

			if (hit && hit.hpLost > 0) {
				let damage = 0;

				// Base damage of half the target hp if is does not know perception or is not a boss
				if (!hit.target.perception && hit.target.type !== 'boss') {
					// 50% HP otherwise
					damage = applyBalanceDamage(hit.target, Math.round(hit.target.hp / 2));
				}

				loseHpBalanced(fightData, hit.target, damage, LifeEffect.Skull);
			}
			break;
		}
		case Skill.GEL: {
			const result = attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.WATER, 5),
				skill.id,
				activate_step
			);

			if (result.target && !result.evasion) {
				// Slow opponent
				addStatus(fightData, result.target, Status.SLOWED, StatusLength.MEDIUM);
			}
			break;
		}
		case Skill.COUP_FATAL: {
			// Get random opponent
			const hit = launchAssault(fightData, fighter, true, skill.id);

			if (hit && hit.hpLost > 0) {
				let damage = 0;

				// Base damage of whole target hp if is does not know perception or is not a boss
				if (!hit.target.perception && hit.target.type !== 'boss') {
					// 100% current HP otherwise
					damage = applyBalanceDamage(hit.target, hit.target.hp);
				}

				loseHpBalanced(fightData, hit.target, damage, LifeEffect.Skull);
			}
			break;
		}
		case Skill.MOIGNONS_LIQUIDES: {
			const opponent = getRandomOpponent(fightData, fighter);

			// TODO simplify history: there is 3 steps added here just for the visual effects
			// Add target
			activate_step.targets.push({ tid: opponent.id });
			// Add 2 steps for fx
			fightData.steps.push(activate_step);
			loseHp(fightData, opponent, 0, LifeEffect.Water);

			opponent.time += 25 * TIME_FACTOR;

			// Add fx for gain of init
			fightData.steps.push({
				action: 'notify',
				fids: [opponent.id],
				notification: NotificationList.InitDown
			});
			break;
		}
		case Skill.PETRIFICATION: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			activate_step.targets.push({ tid: opponent.id });

			// Petrify opponent
			removeStatus(fightData, opponent, Status.FLYING, Status.INTANGIBLE);
			addStatus(fightData, opponent, Status.PETRIFIED, StatusLength.MEDIUM);

			// Instantly cancel if boss
			if (opponent.type === 'boss') {
				removeStatus(fightData, opponent, Status.PETRIFIED);
			}
			break;
		}
		case Skill.RAYON_KAAR_SHER: {
			attackAllOpponents(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.WATER, 7),
				skill.id,
				activate_step
			);

			// Remove mud wall of all opponents
			getOpponents(fightData, fighter).forEach(opponent => {
				if (!opponent.mudWall) return;

				opponent.mudWall = undefined;

				// Add skillExpire step
				fightData.steps.push({
					action: 'skillExpire',
					dinoz: stepFighter(opponent),
					skill: Skill.MUR_DE_BOUE
				});
			});
			break;
		}
		case Skill.DELUGE:
			{
				attackAllOpponents(
					fightData,
					fighter,
					getElementalAttack(fighter, ElementType.WATER, 10),
					skill.id,
					activate_step
				);
				// Increase time of all opponents by 8
				const opponents = getOpponents(fightData, fighter);
				const init_down_notify = {
					action: 'notify',
					fids: [],
					notification: NotificationList.InitDown
				} as NotifyStep;
				opponents.forEach(opponent => {
					opponent.time += 8 * TIME_FACTOR;
					init_down_notify.fids.push(opponent.id);
				});
				fightData.steps.push(init_down_notify);
				break;
			}
			break;
		// WOOD
		case Skill.LANCER_DE_ROCHE:
			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.WOOD, 10),
				skill.id,
				activate_step
			);
			break;
		case Skill.LANCEUR_DE_GLAND:
			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.WOOD, 5),
				skill.id,
				activate_step
			);
			break;
		case Skill.MUR_DE_BOUE: {
			// Add 30 HP mud wall
			fighter.mudWall = 30;
			break;
		}

		// MONSTER
		case Skill.M_COMET:
			attackAllOpponents(
				fightData,
				fighter,
				[
					[ElementType.FIRE, 20],
					[ElementType.VOID, 30]
				],
				skill.id,
				activate_step
			);
			break;
		case Skill.M_VENERABLE:
			attackAllOpponents(
				fightData,
				fighter,
				[
					[ElementType.FIRE, 50],
					[ElementType.AIR, 50]
				],
				skill.id,
				activate_step
			);
			break;
		case Skill.M_GRIZOU: {
			attackAllOpponents(
				fightData,
				fighter,
				[[ElementType.VOID, fighter.stats.base[ElementType.VOID]]],
				skill.id,
				activate_step
			);
			break;
		}
		case Skill.M_WORM_2:
			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.VOID, 5),
				skill.id,
				activate_step
			);
			break;
		case Skill.M_AIR_BLADE: {
			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.AIR, 25),
				skill.id,
				activate_step
			);
			break;
		}
		// RACE
		case Skill.CHARGE_PIGMOU:
			attackSingleOpponent(
				fightData,
				fighter,
				getMultiElementalAttack(fighter, [
					[ElementType.FIRE, 5],
					[ElementType.WOOD, 3]
				]),
				skill.id,
				activate_step,
				undefined,
				true
			);
			break;
		// Other
		case Skill.CATCH: {
			// Get monster opponents
			const opponents = getOpponents(fightData, fighter, ['monster']);

			// Cancel if no monster opponents
			if (!opponents.length) {
				return cancel();
			}

			// Get random opponent
			const monster = opponents[randomBetweenSeeded(fightData.rng, 0, opponents.length - 1)];

			// Attack opponent
			const hit = launchAssault(fightData, fighter, true, undefined, [[0 as ElementType, 0]], monster);

			// Only continue if not already caught and hit and not dead
			if (!monster.catcher && hit && monster.hp > 0) {
				// Change team
				monster.attacker = !monster.attacker;
				monster.catcher = fighter.id;

				// Add hypnotize step
				fightData.steps.push({
					action: 'hypnotize',
					fighter: stepFighter(monster)
				});
			}
			break;
		}

		// Double
		case Skill.SECOUSSE: {
			// Get non flying enemies
			const opponents = getOpponents(fightData, fighter).filter(opponent => !hasStatus(opponent, Status.FLYING));
			attackAllOpponents(
				fightData,
				fighter,
				getMultiElementalAttack(fighter, [
					[ElementType.AIR, 4],
					[ElementType.WOOD, 4]
				]),
				skill.id,
				activate_step,
				opponents
			);
			break;
		}

		// Invocations
		case Skill.HERCOLUBUS: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackAllOpponents(
				fightData,
				fighter,
				getMultiElementalAttack(fighter, [
					[ElementType.AIR, 10],
					[ElementType.FIRE, 10],
					[ElementType.LIGHTNING, 10],
					[ElementType.WATER, 10],
					[ElementType.WOOD, 10]
				]),
				skill.id,
				activate_step
			);
			break;
		}
		case Skill.VULCAIN: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackAllOpponents(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.FIRE, 20),
				skill.id,
				activate_step
			);
			break;
		}
		case Skill.ARMURE_DIFRIT: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			getAllies(fightData, fighter).forEach(ally => {
				// Increase FIRE defense
				ally.stats.defense[ElementType.FIRE] += 20;
			});
			break;
		}
		case Skill.SALAMANDRE: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.FIRE, 30),
				skill.id,
				activate_step
			);
			break;
		}
		case Skill.BALEINE_BLANCHE: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			getAllies(fightData, fighter).forEach(ally => {
				// Increase WATER defense
				ally.stats.defense[ElementType.WATER] += 20;
			});
			break;
		}
		case Skill.LEVIATHAN: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackAllOpponents(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.WATER, 20),
				skill.id,
				activate_step
			);
			break;
		}
		case Skill.ONDINE: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.WATER, 30),
				skill.id,
				activate_step
			);
			break;
		}
		case Skill.LOUP_GAROU: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackAllOpponents(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.WOOD, 30),
				skill.id,
				activate_step
			);
			break;
		}
		case Skill.BENEDICTION_DES_FEES: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			getOpponents(fightData, fighter).forEach(opponent => {
				// Increase time
				opponent.time += 10 * TIME_FACTOR;
			});
			break;
		}
		case Skill.YGGDRASIL: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			getAllies(fightData, fighter).forEach(ally => {
				// Increase WOOD defense
				ally.stats.defense[ElementType.WOOD] += 20;
			});
			break;
		}
		case Skill.RAIJIN: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackAllOpponents(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.LIGHTNING, 20),
				skill.id,
				activate_step
			);
			break;
		}
		case Skill.GOLEM: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			getAllies(fightData, fighter).forEach(ally => {
				// Increase LIGHTNING defense
				ally.stats.defense[ElementType.LIGHTNING] += 20;
			});
			break;
		}
		case Skill.ROI_DES_SINGES: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			getAllies(fightData, fighter).forEach(ally => {
				// Increase evasion
				ally.stats.special.evasion *= 1.2;
			});
			break;
		}
		case Skill.DJINN: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackAllOpponents(fightData, fighter, getElementalAttack(fighter, ElementType.AIR, 20), skill.id, activate_step);
			break;
		}
		case Skill.FUJIN: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			// Cancel if an ally used FUJIN already
			const allies = getAllies(fightData, fighter);

			if (allies.some(ally => hasStatus(ally, Status.USED_FUJIN))) {
				return cancel();
			}

			fighter.invocations -= 1;

			allies.forEach(ally => {
				// Fasten
				ally.stats.speed.global *= 0.5;
			});

			addStatus(fightData, fighter, Status.USED_FUJIN);
			break;
		}
		case Skill.TOTEM_ANCESTRAL_AEROPORTE: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackSingleOpponent(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.AIR, 30),
				skill.id,
				activate_step
			);
			break;
		}
		case Skill.BOUDDHA: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			getAllies(fightData, fighter).forEach(ally => {
				// Increase each defense by 10
				ally.stats.defense[ElementType.FIRE] += 10;
				ally.stats.defense[ElementType.WATER] += 10;
				ally.stats.defense[ElementType.WOOD] += 10;
				ally.stats.defense[ElementType.LIGHTNING] += 10;
				ally.stats.defense[ElementType.AIR] += 10;
				ally.stats.defense[ElementType.VOID] += 10;
			});
			break;
		}
		case Skill.HADES: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			getOpponents(fightData, fighter).forEach(opponent => {
				// Poison
				poison(fightData, opponent, fighter, Skill.HADES, StatusLength.MEDIUM);

				// Slow
				opponent.stats.speed.global *= 1.5;
			});
			break;
		}
		case Skill.REINE_DE_LA_RUCHE: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			getOpponents(fightData, fighter).forEach(opponent => {
				// Set energy to 0
				opponent.energy = 0;

				// Add reduce energy step
				fightData.steps.push({
					action: 'reduceEnergy',
					fighter: stepFighter(opponent)
				});
			});
			break;
		}
		case Skill.QUETZACOATL: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackAllOpponents(
				fightData,
				fighter,
				getElementalAttack(fighter, ElementType.LIGHTNING, 40),
				skill.id,
				activate_step
			);
			break;
		}
		case Skill.BIG_MAMA: {
			// Cancel if no invocation left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			getFighters(fightData).forEach(f => {
				// Empty everyone's energy
				f.energy = 0;

				// Alter opponents statuses
				if (f.attacker !== fighter.attacker) {
					removeStatus(fightData, f, Status.FLYING, Status.INTANGIBLE);
					addStatus(fightData, f, Status.STUNNED, StatusLength.MEDIUM);
				}
			});
			break;
		}

		// Ether skill
		case Skill.CRI_DE_GUERRE: {
			// Find strongest Skill
			const strongestSkill = fighter.skills.reduce((acc, skill) => {
				if (skill.type !== SkillType.A) return acc;

				if (SkillLevel[skill.id] > SkillLevel[acc.id]) {
					return skill;
				}

				// Random if same level
				if (SkillLevel[skill.id] === SkillLevel[acc.id]) {
					return randomBetweenSeeded(fightData.rng, 0, 1) ? skill : acc;
				}

				return acc;
			}, fighter.skills[0]);

			// Set next skill to strongest skill
			fighter.nextSkill = strongestSkill;
			break;
		}
		case Skill.RECEPTACLE_ROCHEUX: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			activate_step.targets.push({ tid: opponent.id });

			// Remove wood sphere skills
			opponent.skills = opponent.skills.filter(
				skill => !skill.isSphereSkill || !skill.element.includes(ElementType.WOOD)
			);

			// Add lose sphere step
			fightData.steps.push({
				action: 'loseSphere',
				fighter: stepFighter(opponent),
				element: ElementType.WOOD
			});
			break;
		}
		case Skill.ACCLAMATION_FRATERNELLE: {
			// Increase energy regen for all allies
			getAllies(fightData, fighter).forEach(ally => {
				ally.stats.special.energyRecovery *= 1.3;

				// TODO: Add gain energy step ?
				// fightData.steps.push({
				// 	action: 'gainEnergy',
				// 	fighter: stepFighter(ally),
				// 	energy: 0
				// });
			});
			break;
		}
		case Skill.EXTENUATION: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			activate_step.targets.push({ tid: opponent.id });

			// Reduce energy recovery by 25%
			opponent.stats.special.energyRecovery *= 0.75;

			// TODO: Add reduce energy step?
			// fightData.steps.push({
			// 	action: 'reduceEnergy',
			// 	fighter: stepFighter(opponent)
			// });
			break;
		}
		case Skill.AMAZONIE: {
			// Only one environment active at a time
			if (fightData.environment) {
				return cancel();
			}

			activateEnvironment(fightData, fighter, Skill.AMAZONIE);
			break;
		}
		case Skill.RECEPTACLE_AQUEUX: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			activate_step.targets.push({ tid: opponent.id });

			// Remove water sphere skills
			opponent.skills = opponent.skills.filter(
				skill => !skill.isSphereSkill || !skill.element.includes(ElementType.WATER)
			);

			// Add lose sphere step
			fightData.steps.push({
				action: 'loseSphere',
				fighter: stepFighter(opponent),
				element: ElementType.WATER
			});
			break;
		}
		case Skill.ABYSSE: {
			// Only one environment active at a time
			if (fightData.environment) {
				return cancel();
			}

			activateEnvironment(fightData, fighter, Skill.ABYSSE);
			break;
		}
		case Skill.RECEPTACLE_TESLA: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			activate_step.targets.push({ tid: opponent.id });

			// Remove lightning sphere skills
			opponent.skills = opponent.skills.filter(
				skill => !skill.isSphereSkill || !skill.element.includes(ElementType.LIGHTNING)
			);

			// Add lose sphere step
			fightData.steps.push({
				action: 'loseSphere',
				fighter: stepFighter(opponent),
				element: ElementType.LIGHTNING
			});
			break;
		}
		case Skill.RECEPTACLE_AERIEN: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			activate_step.targets.push({ tid: opponent.id });

			// Remove air sphere skills
			opponent.skills = opponent.skills.filter(
				skill => !skill.isSphereSkill || !skill.element.includes(ElementType.AIR)
			);

			// Add lose sphere step
			fightData.steps.push({
				action: 'loseSphere',
				fighter: stepFighter(opponent),
				element: ElementType.AIR
			});
			break;
		}
		case Skill.FEU_DE_ST_ELME: {
			// Only one environment active at a time
			if (fightData.environment) {
				return cancel();
			}

			activateEnvironment(fightData, fighter, Skill.FEU_DE_ST_ELME);
			break;
		}
		case Skill.OURANOS: {
			// Only one environment active at a time
			if (fightData.environment) {
				return cancel();
			}

			activateEnvironment(fightData, fighter, Skill.OURANOS);
			break;
		}
		case Skill.RECEPTABLE_THERMIQUE: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			activate_step.targets.push({ tid: opponent.id });

			// Remove fire sphere skills
			opponent.skills = opponent.skills.filter(
				skill => !skill.isSphereSkill || !skill.element.includes(ElementType.FIRE)
			);

			// Add lose sphere step
			fightData.steps.push({
				action: 'loseSphere',
				fighter: stepFighter(opponent),
				element: ElementType.FIRE
			});
			break;
		}
		case Skill.SYLPHIDES: {
			// Get dinoz opponents
			const opponents = getOpponents(fightData, fighter, ['dinoz']);

			if (!opponents.length) {
				return cancel();
			}

			// Get random opponent
			const opponent = opponents[randomBetweenSeeded(fightData.rng, 0, opponents.length - 1)];

			// Add leave step
			fightData.steps.push({
				action: 'leave',
				fighter: stepFighter(opponent),
				animation: LeaveAnimation.FLYING
			});

			opponent.escaped = true;
			break;
		}
		// More race skills
		case Skill.BIGMAGNON: {
			// Attack opponent with a classic assault
			// Note: in MT code it calls directly `attackTarget` but with all descriptors of an assault and with a non-assault specific target
			const target = getRandomOpponent(fightData, fighter);

			// Add moveTo step
			fightData.steps.push({
				action: 'moveTo',
				fid: fighter.id,
				tid: target.id
			});

			attackTarget(fightData, fighter, target, true, undefined, Skill.BIGMAGNON);

			// Cancel FLYING and INTANGIBLE
			removeStatus(fightData, target, Status.FLYING, Status.INTANGIBLE);

			// Add STUNNED if not boss
			if (target.type !== 'boss') {
				addStatus(fightData, target, Status.STUNNED, StatusLength.MEDIUM);
			}

			// Add moveBack step
			fightData.steps.push({
				action: 'moveBack',
				fid: fighter.id
			});

			break;
		}
		case Skill.ECRASEMENT: {
			// Get non flying opponents
			const opponents = getOpponents(fightData, fighter).filter(opponent => !hasStatus(opponent, Status.FLYING));

			// Use a minimum power of 40
			let power = fighter.stats.base[fighter.elements[0]] * 5;
			if (power < 40) {
				power = 40;
			}

			// Use power to launch a custom VOID attack on all opponents (except flying)
			attackAllOpponents(fightData, fighter, [[ElementType.VOID, power]], skill.id, activate_step, opponents);
			break;
		}

		// More monster skills
		case Skill.M_RENFORTS: {
			const monsterDetails =
				Object.values(monsterList).find(monster => monster.name === fighter.name) ||
				Object.values(bossList).find(boss => boss.name === fighter.name);

			if (!monsterDetails) {
				sendJSONToDiscord('Error `Monster not found` in `activateSkill`.', { fightData: fightData, skill: skill });
				throw new Error(`Monster ${fighter.name} not found`);
			}

			createMonster(fightData, fighter, monsterDetails);
			break;
		}
		case Skill.M_ABSORPTION: {
			// Attack opponent
			const hit = launchAssault(fightData, fighter, true, Skill.M_ABSORPTION, [[ElementType.VOID, 10]]);

			if (hit) {
				heal(fightData, fighter, hit.hpLost, undefined, LifeEffect.Heal);
			}
			break;
		}
		case Skill.M_FLIGHT: {
			// Attack opponent
			launchAssault(fightData, fighter, true, skill.id);

			// If not dead
			if (fighter.hp > 0) {
				// Add FLYING
				addStatus(fightData, fighter, Status.FLYING);
			}
			break;
		}
		case Skill.M_INVISIBILITY: {
			getAllies(fightData, fighter).forEach(ally => {
				// Add INTANGIBLE
				addStatus(fightData, ally, Status.INTANGIBLE, StatusLength.SHORT);
			});
			break;
		}
		case Skill.M_BITE: {
			launchAssault(fightData, fighter, true, Skill.M_BITE, [[ElementType.VOID, 7]]);
			break;
		}
		case Skill.M_STINGER: {
			// Fighter attacks opponent
			const hit = launchAssault(fightData, fighter, true, Skill.M_STINGER, [[ElementType.VOID, 7]]);

			// Check if opponent is not dead
			if (hit && hit.target && hit.hpLost > 0) {
				// Add poison
				poison(fightData, hit.target, fighter, Skill.M_STINGER);
			}

			// Half the probability of this skill
			skill.probability = Math.round((skill.probability ?? 0) / 2);
			break;
		}
		case Skill.M_INSTANT_FLEE:
		case Skill.M_FLEE: {
			if (fighter.escaped || fighter.hp <= 0) {
				return cancel();
			}

			// Add leave step
			fightData.steps.push({
				action: 'leave',
				fighter: stepFighter(fighter)
			});

			fighter.escaped = true;
			break;
		}
		case Skill.M_WORM_CALL: {
			createMonster(fightData, fighter, monsterList.EARTHWORM_BABY);

			// Remove skill
			fighter.skills = fighter.skills.filter(s => s.id !== Skill.M_WORM_CALL);
			break;
		}
		case Skill.M_STEAL: {
			// Fighter attacks opponent
			const hit = launchAssault(fightData, fighter, true, skill.id);

			// Check if fighter is not dead
			if (hit && hit.target && hit.hpLost > 0) {
				const opponent = hit.target;
				const goldStolen = (randomBetweenSeeded(fightData.rng, 0, 5) + 8) * 10;
				fighter.goldStolen = {
					...fighter.goldStolen,
					[opponent.id]: (fighter.goldStolen?.[opponent.id] ?? 0) + goldStolen
				};

				// Add stealGold step
				fightData.steps.push({
					action: 'stealGold',
					fighter: stepFighter(fighter),
					target: stepFighter(opponent),
					gold: goldStolen
				});

				// Disable skill
				skill.probability = 0;

				// Add M_FLEE
				const flee = { ...skillList[Skill.M_FLEE] };
				flee.priority = 1;
				flee.probability = 60;
				fighter.skills.push(flee);
			}
			break;
		}
		case Skill.M_ELEMENTAL_DISCIPLE: {
			attackAllOpponents(fightData, fighter, [[ElementType.LIGHTNING, 200]], skill.id, activate_step);

			fighter.escaped = true;

			// Add leave step
			fightData.steps.push({
				action: 'leave',
				fighter: stepFighter(fighter)
			});
			break;
		}
		case Skill.M_ALL_FOR_ONE: {
			// TODO corner case missing, check MT code
			// Get all allies from the same race
			const sameRace = getAllies(fightData, fighter, ['monster']).filter(
				ally => ally.name === fighter.name && ally.time < Infinity
			);

			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			sameRace.forEach(ally => {
				// Ally attacks opponent
				launchAssault(fightData, ally, true, skill.id, undefined, opponent);
			});
			break;
		}
		case Skill.M_LAST_BREATH: {
			getOpponents(fightData, fighter).forEach(opponent => {
				// Poison
				poison(fightData, opponent, fighter, Skill.M_LAST_BREATH, StatusLength.MEDIUM);
			});
			break;
		}
		case Skill.M_DEMYOM_ATTACK: {
			attackAllOpponents(fightData, fighter, getElementalAttack(fighter, fighter.element, 8), skill.id, activate_step);

			// Change element
			fighter.element = fighter.elements[(fighter.elements.indexOf(fighter.element) + 1) % fighter.elements.length];
			break;
		}
		case Skill.M_DEMYOM_HEAL: {
			// TODO cancel announcement
			heal(fightData, fighter, 50, undefined, LifeEffect.Heal);
			break;
		}
		case Skill.M_GROTOX: {
			// Get non flying opponents
			const opponents = getOpponents(fightData, fighter).filter(opponent => !hasStatus(opponent, Status.FLYING));

			attackAllOpponents(fightData, fighter, [[ElementType.VOID, 60]], skill.id, activate_step, opponents);
			break;
		}
		case Skill.M_TORNADO: {
			getOpponents(fightData, fighter).forEach(opponent => {
				// Remove FLYING
				removeStatus(fightData, opponent, Status.FLYING);
			});

			attackAllOpponents(fightData, fighter, getElementalAttack(fighter, ElementType.AIR, 40), skill.id, activate_step);
			break;
		}
		default:
			console.warn('Unknown skill', skill.id);
			return cancel();
	}

	// Not working well to add the activate step for all skills at this point
	// // Add step
	// fightData.steps.push(activate_step);

	// Consume energy
	setEnergy(fighter, fighter.energy - skill.energy);

	if (fighter.type !== 'boss') {
		// Get opponents with SHARIGNAN
		const opponentsWithSharingan = getOpponents(fightData, fighter).filter(opponent =>
			opponent.skills.some(skill => skill.id === Skill.SHARIGNAN)
		);

		opponentsWithSharingan.forEach(opponent => {
			// Abort if opponent already has the skill
			if (opponent.skills.some(s => s.id === skill.id)) return;

			// 20% chance to copy the skill
			const random = fightData.rng();

			if (random < 0.2) {
				// Add skillActivate step
				fightData.steps.push({
					action: 'skillAnnounce',
					fid: opponent.id,
					skill: Skill.SHARIGNAN
				});

				// Add skill to opponent
				opponent.skills.push({ ...skill });
			}
		});
	}

	// Reset next skill
	if (skill.id === fighter.nextSkill?.id) {
		fighter.nextSkill = undefined;
	}

	return true;
};

const counterAttack = (fightData: DetailedFight, opponent: DetailedFighter) => {
	// No counter attack if opponent is dead
	if (opponent.hp <= 0) return false;

	const random = fightData.rng();
	const countered = random < opponent.stats.special.counter - 1;

	// Counter stat
	if (countered) {
		updateStat(fightData, opponent, 'counters', 1);
	}

	return countered;
};

const loseHpBalanced = (fightData: DetailedFight, fighter: DetailedFighter, damage: number, fx: LifeEffect) => {
	loseHp(fightData, fighter, applyBalanceDamage(fighter, damage), fx);
};

const loseHp = (fightData: DetailedFight, fighter: DetailedFighter, damage: number, fx: LifeEffect) => {
	// TODO: check for danger detector item
	fighter.hp -= damage;

	// Note: This is not in MT's code. May affect resurrection skills and how much overkill an attack does.
	if (fighter.hp < 0) {
		fighter.hp = 0;
	}

	fightData.steps.push({
		action: 'looseHp',
		fid: fighter.id,
		hp: damage,
		fx
	});
};

const poison = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	poisoner: DetailedFighter,
	skill: Skill,
	duration = StatusLength.INFINITE
) => {
	// No poison if fighter is dead
	if (fighter.hp <= 0) return;

	// No poison if fighter is already poisoned
	if (hasStatus(fighter, Status.POISONED)) return;

	// No poison if fighter is cured
	if (hasStatus(fighter, Status.CURED)) return;

	// No poison if fighter has NO_POISON
	if (hasStatus(fighter, Status.NO_POISON)) return;

	// Check if fighter has Item.ANTIDOTE
	if (fighter.items.some(item => item.itemId === Item.ANTIDOTE)) {
		// Add item use step
		fightData.steps.push({
			action: 'itemUse',
			fighter: stepFighter(fighter),
			itemId: Item.ANTIDOTE
		});

		// Set CURED
		addStatus(fightData, fighter, Status.CURED);
		return;
	}

	// Check if fighter has Item.POISONITE_SHOT
	if (fighter.items.some(item => item.itemId === Item.POISONITE_SHOT)) {
		// Remove item
		const itemIndex = fighter.items.findIndex(item => item.itemId === Item.POISONITE_SHOT);
		fighter.items.splice(itemIndex, 1);

		// Add to items used
		fighter.itemsUsed.push(Item.POISONITE_SHOT);

		// Add item use step
		fightData.steps.push({
			action: 'itemUse',
			fighter: stepFighter(fighter),
			itemId: Item.POISONITE_SHOT
		});

		// Set CURED
		addStatus(fightData, fighter, Status.CURED);
		return;
	}

	// Get poison damage
	let poisonDamage = 0;
	switch (skill) {
		case Skill.AURA_PUANTE: {
			poisonDamage = 10;
			break;
		}
		case Skill.GRIFFES_EMPOISONNEES: {
			poisonDamage = 14;
			break;
		}
		case Skill.HADES: {
			poisonDamage = 14;
			break;
		}
		case Skill.NUAGE_TOXIQUE: {
			poisonDamage = poisoner.stats.base[ElementType.AIR];
			break;
		}
		case Skill.HALEINE_FETIVE: {
			poisonDamage = poisoner.stats.base[ElementType.AIR];
			break;
		}
		case Skill.M_STINGER: {
			poisonDamage = 5;
			break;
		}
		case Skill.M_CONTAMINATION: {
			poisonDamage = 3;
			break;
		}
		case Skill.M_LAST_BREATH: {
			poisonDamage = 3;
			break;
		}
		default:
			console.warn(`Poison skill ${skill} not implemented`);
			break;
	}

	fighter.poisonedBy = {
		id: poisoner.id,
		skill,
		damage: poisonDamage
	};

	addStatus(fightData, fighter, Status.POISONED, duration);

	// Poison stats
	updateStat(fightData, fighter, 'poisoned', 1);
};

// Helper method to heal a fighter
export const heal = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	hp: number,
	step?: FightStep,
	fx?: LifeEffect,
	isItem?: boolean
) => {
	// No heal if BEER
	// TODO add fx for no healing
	if (hasStatus(fighter, Status.BEER)) return;

	const hpBeforeHeal = fighter.hp;

	let healBonus = 1;

	// Apply cook bonus only to item healing
	if (isItem) {
		if (fighter.attacker && fightData.attackerData.hasCook) {
			healBonus *= 1.1;
		} else if (!fighter.attacker && fightData.defenderData.hasCook) {
			healBonus *= 1.1;
		}
	}

	fighter.hp += Math.round(hp * healBonus);

	if (fighter.hp > fighter.startingHp) {
		fighter.hp = fighter.startingHp;
	}

	const healAmount = fighter.hp - hpBeforeHeal;

	// Remove fighter from deads if it was?

	const lifeFx = fx ?? LifeEffect.Heal;

	// Add heal step or use provided step
	if (step) {
		(step as SkillActivateStep).targets.push({
			tid: fighter.id,
			damages: healAmount
		});
	} else {
		fightData.steps.push({
			action: 'heal',
			fighter: stepFighter(fighter),
			hp: healAmount,
			fx: lifeFx
		});
	}

	// Heal stats
	updateStat(fightData, fighter, 'hpHealed', healAmount);

	// Group therapy
	const opponentsWhoCanCopyHeal = getOpponents(fightData, fighter).filter(opponent =>
		hasStatus(opponent, Status.COPY_HEAL)
	);

	opponentsWhoCanCopyHeal.forEach(opponent => {
		// Heal opponent
		heal(fightData, opponent, healAmount, undefined, LifeEffect.Heal);

		removeStatus(fightData, opponent, Status.COPY_HEAL);
	});
};

/**
 * Sort elements based on medium ennemies defense
 * The way this is written means that the method should be called after the fight data has been constructed
 * @param fightData Data about the fight to know about all the opponents
 * @param fighter The fighter to update the element wheel. The element order and first element of this fighter will be updated.
 */
export const applyStrategy = (fightData: DetailedFight, fighter: DetailedFighter) => {
	// Subtract the fighter assault for each element
	const defenses = [
		{ element: ElementType.FIRE, defense: -fighter.stats.base[ElementType.FIRE] * 5 },
		{ element: ElementType.WATER, defense: -fighter.stats.base[ElementType.WATER] * 5 },
		{ element: ElementType.WOOD, defense: -fighter.stats.base[ElementType.WOOD] * 5 },
		{ element: ElementType.LIGHTNING, defense: -fighter.stats.base[ElementType.LIGHTNING] * 5 },
		{ element: ElementType.AIR, defense: -fighter.stats.base[ElementType.AIR] * 5 }
	];

	// Add all opponents defense
	getOpponents(fightData, fighter).forEach(opponent => {
		defenses.forEach(defense => {
			defense.defense += opponent.stats.defense[defense.element];
		});
	});

	// Sort elements by defense
	defenses.sort((a, b) => a.defense - b.defense);

	// Apply order to fighter elements
	// Note: filter out elements that are not in the fighter's element wheel, this is so that strategy does not mess up with Specialist and other skills
	fighter.elements = defenses
		.filter(defense => fighter.elements.includes(defense.element))
		.map(defense => defense.element);
	// Update the first element of the fighter
	fighter.element = fighter.elements[0];
};

/// Determines the attack power of the attacker, the defense of the target, the damage inflicted.
/// Then applies defense effects such as burn, evasion, etc. then check for combos and also counter, and probably more.
/// Note: it is difficult to breakdown this method as the pieces are intertwined.
/// This method does not perform target selection
/// By default, it is considered a distant attack (i.e closeCombat = false) and without combo (allowCombo = false)
const attackTarget = (
	fightData: DetailedFight,
	attacker: DetailedFighter,
	target: DetailedFighter,
	isAssault?: boolean,
	power?: [ElementType, number][],
	skill?: Skill,
	step?: FightStep
) => {
	// Unless specified, the attack is considered not an assault and cannot combo by default
	isAssault = isAssault ?? false;
	let canCombo = isAssault ?? false;

	// Abort if fighter is dead
	if (attacker.hp <= 0) {
		return {
			attacker: attacker,
			target: target,
			isAssault: isAssault,
			evasion: false,
			hpLost: 0
		};
	}

	// Note: combo counter seems to work weirdly, or may be note...
	// Fighter passes its turn if it has reached max combo at this step
	if (attacker.comboCounter >= MAXIMUM_COMBO_COUNT) {
		fightData.steps.push({
			action: 'tired',
			fighter: stepFighter(attacker)
		});
		return {
			attacker: attacker,
			target: target,
			isAssault: isAssault,
			evasion: false,
			hpLost: 0
		};
	}

	// Store as previous target
	attacker.previousTarget = target.id;

	// TODO: rework, friendly whistle effect takes place at the beginning of the next turn
	// Add teammates if Item.FRIENDLY_WHISTLE
	// const attackers = [attacker];
	// if (fighter.items.some(item => item.itemId === Item.FRIENDLY_WHISTLE)) {
	// 	const allies = getAllies(fightData, fighter).filter(
	// 		ally => ally.id !== fighter.id && !ally.items.some(item => item.itemId === Item.FRIENDLY_WHISTLE)
	// 	);
	// 	attackers.push(...allies);
	// }
	// // Group attacks stat
	// if (attackers.length > 1) {
	// 	updateStat(fightData, fighter, 'groupAttacks', 1);
	// }

	const realOpponent = target;

	let energyCost = BASE_ENERGY_COST;

	// If the power is not defined, default to a basic assault
	if (!power) {
		// This is default basic assault
		power = getElementalAttack(
			attacker,
			attacker.element,
			attacker.element === ElementType.VOID ? VOID_ASSAULT_POWER : ASSAULT_POWER
		);
	} else {
		// Any attack where the power was pre-defined cannot combo
		canCombo = false;
	}

	const { attack, defense, elements } = getAttackDefense(attacker, target, power, isAssault);

	let totalDamage = 0;
	let totalEnergyCost = energyCost;
	let evasion = false;

	// TODO: rework multiple attackers (part of whistle rework)
	// for (const attacker of attackers) {
	// }
	// NOTE: combo counter seems to work weirdly, or may be not
	while (attacker.comboCounter < MAXIMUM_COMBO_COUNT) {
		// Increment the attacker's combo counter
		// Note: If we arrive here, the comboCounter is already at 1 due to turn initialization
		// Note: this would prevent infinite counter too...
		attacker.comboCounter++;

		// Get damage
		let damage = calculateDamage(fightData.rng, attacker, target, attack, defense, isAssault);

		// Apply defensive effects
		damage = checkDefensiveEffects(
			fightData,
			attacker,
			target,
			damage,
			elements,
			isAssault,
			skill ? skillList[skill].type !== SkillType.I : false
		);

		// Check for assault dodge
		let isDodged = false;
		if (isAssault && !hasStatus(target, Status.PETRIFIED) && fightData.rng() < target.stats.special.evasion - 1) {
			isDodged = true;
		}

		// Check for skill evasion
		let isSuperDodged = false;
		if (
			!isAssault &&
			!(
				hasStatus(target, Status.PETRIFIED) ||
				hasStatus(target, Status.ASLEEP) ||
				hasStatus(target, Status.FLYING) ||
				hasStatus(target, Status.STUNNED)
			) &&
			fightData.rng() < target.stats.special.superEvasion - 1
		) {
			isSuperDodged = true;
		}

		// Check for special statuses: flying, intangible, dazzled
		let noDamage = false;
		// FLYING
		if (
			isAssault &&
			// Opponent has FLYING
			hasStatus(realOpponent, Status.FLYING) &&
			// Attacker doesn't have FLYING
			!hasStatus(attacker, Status.FLYING) &&
			// Attacker can't hit flying opponent
			!attacker.canHitFlying
		) {
			noDamage = true;
		}

		// INTANGIBLE
		let break_intangible = false;
		if (hasStatus(target, Status.INTANGIBLE)) {
			if ((isAssault && attacker.canHitIntangible) || elements.some(e => e == ElementType.AIR)) {
				damage = 1;
				break_intangible = true;
			} else {
				noDamage = true;
			}
		}

		// DAZZLED
		if (hasStatus(attacker, Status.DAZZLED)) {
			if (randomBetweenMaxExcludedSeeded(fightData.rng, 0, 3) === 0) {
				noDamage = true;
				evasion = true;
			}
		}

		if (isDodged || isSuperDodged) {
			evasion = true;
			updateStat(fightData, attacker, 'evasions', 1);
		}

		if (isDodged || isSuperDodged || noDamage) {
			damage = 0;
			// Difference with MT code, if the assault is dodged (due to flying or dodge) or the skill is super dodged, then intangible is not cancelled
			break_intangible = false;
		}

		// Apply and log damage
		target.hp -= damage;

		// Set hp minimum to 0.
		// Note: This is not in MT's code. May affect resurrection skills and how much overkill an attack does.
		if (target.hp < 0) {
			target.hp = 0;
		}

		totalDamage += damage;

		// Update skill step or add hit step
		if (step) {
			const skillTarget = (step as SkillActivateStep).targets.find(t => t.tid === target.id);
			if (!skillTarget) throw new ExpectedError(`Target ${target.id} doesn't exist in step ${step}`);
			skillTarget.damages = evasion ? null : damage; // If the attack was evaded, mark the damage as null
		} else {
			fightData.steps.push({
				action: 'hit',
				fighter: stepFighter(attacker),
				target: stepFighter(target),
				damage: evasion ? null : damage, // If the attack was evaded, mark the damage as null
				elements: elements,
				skill
			});
		}

		// Break intangible if conditions met
		if (break_intangible) {
			removeStatus(fightData, target, Status.INTANGIBLE);
		}

		// Update the attacker's energy
		totalEnergyCost += energyCost;

		// Check for after attack effects of the attacker
		checkAfterAttackEffects(fightData, attacker, target, damage, elements, isAssault, isDodged);

		// Check for after defense effects of the target
		checkAfterDefenseEffects(fightData, attacker, target, damage, elements, isAssault, isDodged);

		// Check for combo
		if (canCombo) {
			if (fightData.rng() < attacker.stats.special.multihit - 1) {
				// If the fighter succeeds to combo, increase the energy cost and repeat the loop
				energyCost++;
				updateStat(fightData, attacker, 'multiHits', 1);
				continue;
			}
		}

		break;
	}

	// Consume the energy at the end
	setEnergy(attacker, attacker.energy - totalEnergyCost);

	// Update stats
	elements.forEach(e => {
		updateStat(fightData, attacker, 'el.damage_dealt', totalDamage, e);
		updateStat(fightData, attacker, 'el.attacks', 1, e);
		updateStat(fightData, target, 'el.damage_received', totalDamage, e);
		updateStat(fightData, target, 'el.defenses', 1, e);
	});
	updateStat(fightData, target, 'hpLost', totalDamage);
	updateStat(fightData, attacker, 'attacks', 1);
	if (!skill) {
		updateStat(fightData, attacker, 'assaults', 1);
	}

	// The target can counter if it's still alive and the attack was in close combat
	if (target.hp > 0) {
		if (isAssault && !hasStatus(target, Status.PETRIFIED) && counterAttack(fightData, target)) {
			// Add counter step
			fightData.steps.push({
				action: 'counter',
				fighter: stepFighter(target),
				opponent: stepFighter(attacker)
			});

			// Opponent attacks fighter: the counter can combo
			attackTarget(fightData, target, attacker, true);
		}
	}

	return {
		attacker: attacker,
		target: target,
		isAssault: isAssault,
		evasion: evasion,
		hpLost: totalDamage
	};
};

const checkDefensiveEffects = (
	fightData: DetailedFight,
	attacker: DetailedFighter,
	target: DetailedFighter,
	damage: number,
	elements: ElementType[],
	isCloseCombat: boolean,
	isInvocation: boolean
) => {
	// Reduce damage by bulle percentage
	if (
		// Opponent has BULLE
		target.stats.special.bubbleRate > 1 &&
		// Don't trigger on assaults and invocations
		!isCloseCombat &&
		!isInvocation &&
		// Don't trigger for bosses
		attacker.type !== 'boss' &&
		// Don't trigger for WOOD
		!elements.includes(ElementType.WOOD) &&
		// Don't trigger for VOID
		!elements.includes(ElementType.VOID)
	) {
		damage = Math.round(damage * (target.stats.special.bubbleRate - 1));

		// TODO add bubble effect post skill/hit
		// if (actualDamage[opponent.id] < damage) {
		// 	// Add resist step
		// 	fightData.steps.push({
		// 		action: 'resist',
		// 		dinoz: stepFighter(opponent)
		// 	});
		// }
	}

	// FORME VAPOREUSE
	if (
		// Opponent has FORME_VAPOREUSE
		target.skills.find(skill => skill.id === Skill.FORME_VAPOREUSE) &&
		// 6% chance
		randomBetweenSeeded(fightData.rng, 0, 99) < 6
	) {
		fightData.steps.push({
			action: 'skillAnnounce',
			fid: target.id,
			skill: Skill.FORME_VAPOREUSE
		});
		// Add INTANGIBLE
		addStatus(fightData, target, Status.INTANGIBLE, StatusLength.SHORT);
	}

	// CUIRASSE
	if (
		isCloseCombat &&
		target.skills.find(s => s.id === Skill.CUIRASSE) &&
		// 5 % chance
		randomBetweenSeeded(fightData.rng, 0, 99) < 5
	) {
		fightData.steps.push({
			action: 'skillAnnounce',
			fid: target.id,
			skill: Skill.CUIRASSE
		});
		// Reduce damage by 5
		damage = Math.max(damage - 5, 0);
	}

	// Check for mud wall
	if (target.mudWall) {
		// TODO announce skill only the first time it tanks damage
		fightData.steps.push({
			action: 'skillAnnounce',
			fid: target.id, // Different fighter id?
			skill: Skill.MUR_DE_BOUE
		});
		target.mudWall -= damage;

		// If negative, the overflow damage goes through the mud wall
		if (target.mudWall < 0) {
			damage = -target.mudWall; // Negative of negative: positive!
		} else {
			target.mudWall = 0;
		}

		if (target.mudWall <= 0) {
			target.mudWall = undefined;

			// TODO add expire effect post skill/hit
			// // Add skillExpire step
			// fightData.steps.push({
			// 	action: 'skillExpire',
			// 	dinoz: stepFighter(target),
			// 	skill: Skill.MUR_DE_BOUE
			// });
		}
	}

	// M_RESISTANCE
	// Cancels any non assault attacks
	if (!isCloseCombat && target.skills.find(s => s.id === Skill.M_RESISTANCE)) {
		// 0 damage if skill
		damage = 0;

		fightData.steps.push({
			action: 'skillAnnounce',
			fid: target.id,
			skill: Skill.M_RESISTANCE
		});
	}

	// M_PROTECTION
	if (isCloseCombat && target.skills.find(s => s.id === Skill.M_PROTECTION)) {
		// Only take 1/3 damage on assaults
		damage = Math.ceil(damage / 3);
	}

	// M_ELEMENTAL
	if (target.skills.find(s => s.id === Skill.M_ELEMENTAL)) {
		if (elements.find(e => e === target.element)) {
			// Take 29 + 0-3 damage if the attack contains the element of the opposing fighter
			const random = randomBetweenSeeded(fightData.rng, 0, 3);

			damage = 29 + random;
		} else {
			// Else nothing, damage is fully negated
			damage = 0;
		}
	}

	// M_DISABLE
	if (damage && target.skills.find(s => s.id === Skill.M_DISABLE)) {
		damage = 1;
	}

	// M_WORM: absorb all water damage
	if (elements.includes(ElementType.WATER) && target.skills.find(s => s.id === Skill.M_WORM)) {
		target.absorbed = damage;
		damage = 0;
	}

	// M_VEGETOX_DEFENDER: cancel all lightning damage
	if (target.skills.some(skill => skill.id === Skill.M_VEGETOX_DEFENDER)) {
		if (elements.includes(ElementType.LIGHTNING)) {
			damage = 0;
		}
	}

	return damage;
};

const checkAfterAttackEffects = (
	fightData: DetailedFight,
	attacker: DetailedFighter,
	target: DetailedFighter,
	damage: number,
	elements: ElementType[],
	isCloseCombat: boolean,
	isDodged: boolean
) => {
	// Poison opponent if fighter has Skill.GRIFFES_EMPOISONNEES and launched a water assault that dealt a least 1 damage
	if (
		isCloseCombat &&
		damage > 0 &&
		elements.find(element => element === ElementType.WATER) &&
		attacker.skills.find(skill => skill.id === Skill.GRIFFES_EMPOISONNEES)
	) {
		poison(fightData, target, attacker, Skill.GRIFFES_EMPOISONNEES, StatusLength.MEDIUM);
	}

	// CONCENTRATION: save last target ID if it was an assault and the target is not the same as the original side of the attacker
	if (
		isCloseCombat &&
		attacker.attacker != target.attacker &&
		attacker.skills.find(skill => skill.id === Skill.CONCENTRATION)
	) {
		attacker.previousTarget = target.id;
	}

	// Poison opponent if fighter has Skill.HALEINE_FETIVE and landed a hit with an assault
	if (isCloseCombat && damage > 0 && attacker.skills.find(skill => skill.id === Skill.HALEINE_FETIVE)) {
		poison(fightData, target, attacker, Skill.HALEINE_FETIVE, StatusLength.LONG);
	}

	// TODO
	// "M_FEBREZ" skill for Valentine?
	// 		if (realOpponent.type === 'dinoz' && attacker.skills.find(skill => skill.id === Skill.M_FEBREZ)) {
	// 			// Regen 5% HP
	// 			heal(fightData, realOpponent, Math.round(realOpponent.maxHp * 0.05 + 0.5));
	// 		}

	// Burn opponent if fighter has Skill.GRIFFES_INFERNALES and landed a hit with an assault that was not dodged
	if (isCloseCombat && !isDodged && attacker.skills.find(skill => skill.id === Skill.GRIFFES_INFERNALES)) {
		const damage = attacker.stats.base[ElementType.FIRE];

		target.burnedBy = {
			id: attacker.id,
			skill: Skill.GRIFFES_INFERNALES,
			damage
		};
		addStatus(fightData, target, Status.BURNED, StatusLength.MEDIUM);
	}

	// 30% chance to steal all energy from target if fighter has Skill.QI_GONG and landed a hit with an assault
	if (isCloseCombat && damage > 0 && attacker.skills.some(skill => skill.id === Skill.QI_GONG)) {
		// 30% Chance to deplete energy
		if (fightData.rng() < 0.3) {
			// TODO announce the skill
			const energyStolen = target.energy;

			setEnergy(target, 0);
			setEnergy(attacker, attacker.energy + energyStolen);
		}
	}

	// Cancel FLYING
	if (!hasStatus(attacker, Status.KEEP_FLYING)) {
		removeStatus(fightData, attacker, Status.FLYING);
	}
};

const checkAfterDefenseEffects = (
	fightData: DetailedFight,
	attacker: DetailedFighter,
	target: DetailedFighter,
	damage: number,
	elements: ElementType[],
	isCloseCombat: boolean,
	isDodged: boolean
) => {
	// Objet: voleur de vie
	// TODO

	// Objet: costume
	// TODO

	// Statuses: sleep, flames Torche (competence ou briqué), intangible,
	// Torch: close combat and hit landed
	if (isCloseCombat && damage > 0 && hasStatus(target, Status.TORCHED)) {
		loseHpBalanced(fightData, attacker, target.stats.special.torchDamage, LifeEffect.Fire);
	}

	// Burn
	if (isCloseCombat && damage > 0 && hasStatus(target, Status.BURNED)) {
		loseHpBalanced(fightData, attacker, 1, LifeEffect.Fire);
	}

	// Skills:
	// Accupuncture (through a status): close combat and hit landed
	if (isCloseCombat && damage > 0 && hasStatus(target, Status.HEALING)) {
		loseHp(fightData, attacker, 1, LifeEffect.Normal);
	}

	// Sang acide: close combat and hit landed
	if (
		isCloseCombat &&
		damage > 0 &&
		target.skills.find(skill => skill.id === Skill.SANG_ACIDE) &&
		// 1/2 chance
		randomBetweenSeeded(fightData.rng, 0, 1) === 0
	) {
		loseHpBalanced(fightData, attacker, target.stats.special.acidBloodDamage, LifeEffect.Acid);
	}

	// Aura puante: close combat and hit landed, the attacker must not be poisoned
	if (
		isCloseCombat &&
		damage > 0 &&
		!hasStatus(attacker, Status.POISONED) &&
		target.skills.find(skill => skill.id === Skill.AURA_PUANTE)
	) {
		// TODO announce the skill
		poison(fightData, attacker, target, Skill.AURA_PUANTE, StatusLength.MEDIUM);
	}

	// Bulle (add fx?)

	// Electrocution (Anguilloz)
	if (isCloseCombat && damage > 0 && target.skills.find(skill => skill.id === Skill.M_ELECTROCUTION)) {
		loseHp(fightData, attacker, randomBetweenSeeded(fightData.rng, 1, 3), LifeEffect.Lightning);
	}

	// Worm (or any absorb?): heal the damage absorbed
	if (target.absorbed && target.skills.find(skill => skill.id === Skill.M_WORM)) {
		heal(fightData, target, target.absorbed, undefined, LifeEffect.Water);
	}

	// Vol d'or
	// TODO

	// Spikes (M_POISONED_PICKS - Cactus): attacker takes dammage after an assault and cactus spikes increaase
	if (isCloseCombat && damage > 0 && target.spikes) {
		loseHp(fightData, attacker, target.spikes, LifeEffect.Poison);
		target.spikes += 1;
	}

	// Contamination (Gropignon): 1 out of 5 chance to poison attacker if hit by assault
	if (
		isCloseCombat &&
		damage > 0 &&
		target.skills.some(skill => skill.id === Skill.M_CONTAMINATION) &&
		// 1/5 chance
		randomBetweenSeeded(fightData.rng, 0, 4) === 0
	) {
		// TODO announce the skill
		poison(fightData, attacker, target, Skill.M_CONTAMINATION, StatusLength.SHORT);
	}

	// Repousse (garde végétox)

	// Source de vie

	// Vide énergétique

	// Mur de boue ??

	// Wake up:
	// Without Amazonie, wake up if the target lost at least 1 hp
	// With Amazonie, wake up if the target lost at least 11 hp
	if (
		(fightData.environment?.type !== Skill.AMAZONIE && damage > 0) ||
		(fightData.environment?.type === Skill.AMAZONIE && damage > 10)
	) {
		removeStatus(fightData, target, Status.ASLEEP);
	}
};

export const checkDeaths = (fightData: DetailedFight) => {
	let attackersAlive = 0;
	let defendersAlive = 0;

	for (let i = 0; i < fightData.fighters.length; i++) {
		const fighter = fightData.fighters[i];

		// Skip escaped fighters
		if (fighter.escaped) continue;

		// Only add death step if fighter is dead and hasn't died yet
		if (fighter.hp <= 0 && fightData.deads.filter(fid => fid === fighter.id).length === 0) {
			// Check if dinoz can survive
			if (fighter.canSurvive) {
				fighter.canSurvive = false;

				// Update history & heal
				fightData.steps.push({
					action: 'skillAnnounce',
					fid: fighter.id,
					skill: Skill.SURVIE
				});
				fightData.steps.push({
					action: 'skillActivate',
					fid: fighter.id,
					skill: Skill.SURVIE,
					targets: []
				});
				heal(fightData, fighter, 12, undefined, LifeEffect.Heal);

				// Make sure the fighter is counted as alive
				if (fighter.attacker) {
					attackersAlive++;
				} else {
					defendersAlive++;
				}
				continue;
			}

			// Check if dinoz has SCALE
			if (fighter.items.some(item => item.itemId === Item.SCALE)) {
				// Get random opponent
				const opponent = getRandomOpponent(fightData, fighter);

				if (opponent) {
					// Add item use step
					fightData.steps.push({
						action: 'itemUse',
						fighter: stepFighter(fighter),
						itemId: Item.SCALE
					});

					// Kill opponent
					loseHp(fightData, fighter, opponent.hp, LifeEffect.Skull);
				}
			}

			// NO_DEATH
			if (hasStatus(fighter, Status.NO_DEATH)) {
				// Add leave step
				fightData.steps.push({
					action: 'leave',
					fighter: stepFighter(fighter)
				});

				fighter.escaped = true;

				continue;
			}

			// Phoenix Feather
			if (fighter.skills.some(skill => skill.id === Skill.PLUMES_DE_PHOENIX)) {
				// Add skillActivate step
				const res_step: SkillActivateStep = {
					action: 'skillActivate',
					fid: fighter.id,
					skill: Skill.PLUMES_DE_PHOENIX,
					targets: []
				};

				// Heal to 12 HP
				// TODO swap for resurrect method
				heal(fightData, fighter, 12 - fighter.hp, res_step);
				// TODO add heal affect?

				// Increase other fighters time by 10 * speed
				getFighters(fightData).forEach(f => {
					if (f.id !== fighter.id) {
						f.time += 10 * TIME_FACTOR * fighter.stats.speed.global;
					}
				});

				// TODO add init up notification for resurrected fighter
			}

			// Add death step
			fightData.steps.push({
				action: 'death',
				fighter: stepFighter(fighter)
			});
			fightData.deads.push(fighter.id);

			// Reset stolen gold
			fighter.goldStolen = undefined;

			// M_INFINITE_REINFORCEMENTS
			if (fighter.skills.some(skill => skill.id === Skill.M_INFINITE_REINFORCEMENTS)) {
				// Add skillActivate step
				fightData.steps.push({
					action: 'skillActivate',
					fid: fighter.id,
					skill: Skill.M_INFINITE_REINFORCEMENTS,
					targets: []
				});

				// Create a new monster
				const monsterDetails = Object.values(monsterList).find(monster => monster.name === fighter.name);

				if (!monsterDetails) {
					sendJSONToDiscord('Error `Monster not found` in `checkDeath`.', { fightData: fightData });
					throw new Error(`Monster ${fighter.name} not found`);
				}

				const alliesCount = getAllies(fightData, fighter).length;

				if (alliesCount < 6) {
					createMonster(fightData, fighter, monsterDetails);

					if (fighter.attacker) {
						attackersAlive++;
					} else {
						defendersAlive++;
					}
				}
				if (alliesCount < 5) {
					createMonster(fightData, fighter, monsterDetails);

					if (fighter.attacker) {
						attackersAlive++;
					} else {
						defendersAlive++;
					}
				}
			}

			// DEMYOM
			if (fighter.skills.some(skill => skill.id === Skill.M_DEMYOM_ATTACK)) {
				const opponentDinoz = getOpponents(fightData, fighter, ['dinoz']);

				// Curse dinoz
				if (opponentDinoz.length) {
					opponentDinoz.forEach(opponent => {
						// Add curse step
						fightData.steps.push({
							action: 'cursed',
							fighter: stepFighter(opponent)
						});

						opponent.permanentStatusGained.push(DinozStatusId.CUSCOUZ_MALEDICTION);

						// Add costume step
						fightData.steps.push({
							action: 'setCostume',
							fighter: stepFighter(opponent),
							costume: monsterList.FRUTOX_DEFENDER.name
						});
					});
				} else {
					// Heal boss
					heal(fightData, fighter, 50, undefined, LifeEffect.Heal);
				}
			}

			// Remove catches from combat
			getAllies(fightData, fighter)
				.filter(ally => ally.catcher === fighter.id)
				.forEach(monster => {
					// Add leave step
					fightData.steps.push({
						action: 'leave',
						fighter: stepFighter(monster)
					});

					monster.escaped = true;
				});
		}

		// Cancel environment if the caster died
		if (fightData.environment && fighter.id === fightData.environment.caster.id) {
			cancelEnvironment(fightData);
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

const endTurnChecks = (fightData: DetailedFight, attacker: DetailedFighter) => {
	// Calculate new attacker's time
	let time = TIME_BASE * TIME_FACTOR * attacker.stats.speed.global * attacker.stats.speed[attacker.element];

	// Round up time
	time = Math.round(time);

	// Minimum time increment of 1
	if (time <= 0) {
		time = 1;
	}

	// Add the new time to the attacker
	attacker.time += time;

	// Change fighter element
	if (!hasStatus(attacker, Status.LOCKED)) {
		attacker.element = attacker.elements[(attacker.elements.indexOf(attacker.element) + 1) % attacker.elements.length];
	}
};

export const playFighterTurn = (fightData: DetailedFight) => {
	const attacker = fightData.fighters[0];

	// Environment
	if (fightData.environment && attacker.id === fightData.environment.caster.id) {
		// Decrease turns left
		fightData.environment.turnsLeft--;

		// Remove environment if no more turns left
		if (fightData.environment.turnsLeft <= 0) {
			cancelEnvironment(fightData);
		} else {
			if (fightData.environment.type === Skill.FEU_DE_ST_ELME) {
				// Take 5% HP for LIGHTNING_STRUCK fighters
				getFighters(fightData).forEach(f => {
					if (hasStatus(f, Status.LIGHTNING_STRUCK)) {
						const damage = Math.round(f.hp * 0.05);

						// Register the hit
						loseHp(fightData, attacker, Math.ceil(attacker.hp * 0.05), LifeEffect.Skull);
					}
				});
			}
		}
	}

	// Hypnosis
	if (attacker.hypnotized) {
		// Decrease turns left
		attacker.hypnotized--;

		// Remove hypnotize if no more turns left
		if (attacker.hypnotized <= 0) {
			// Change team
			attacker.attacker = !attacker.attacker;
			attacker.hypnotized = undefined;

			// Add hypnotize step
			fightData.steps.push({
				action: 'endHypnosis',
				fighter: stepFighter(attacker)
			});
		}
	}

	// Curse locker
	if (attacker.locked) {
		// Decrease turns left
		attacker.locked--;

		// Remove curse if no more turns left
		if (attacker.locked <= 0) {
			attacker.locked = undefined;

			// Remove LOCKED
			removeStatus(fightData, attacker, Status.LOCKED);
		}
	}

	// Calculate the elapsed time
	const deltaTime = attacker.time - fightData.time;

	// Set current time to first fighter time
	fightData.time = fightData.fighters[0].time;

	// Recover energy for all fighters except the current one
	getFighters(fightData).forEach(f => {
		if (f.id === attacker.id) return;
		setEnergy(f, Math.round(f.energy + f.stats.special.energyRecovery * deltaTime * ENERGY_RECOVERY_BASE_FACTOR));
	});

	// Log a new turn
	fightData.steps.push({
		action: 'newTurn',
		fighter: stepFighter(attacker),
		delta: deltaTime
	});
	if (deltaTime > 0) {
		// Handle statuses
		getFighters(fightData).forEach(fighter => {
			fighter.status.forEach(status => {
				status.time -= deltaTime;

				if (status.cycle) {
					status.timeSinceLastCycle += deltaTime;

					if (status.timeSinceLastCycle >= CYCLE) {
						switch (status.type) {
							case Status.POISONED: {
								const poisonedBy = fighter.poisonedBy;

								if (!poisonedBy) {
									sendJSONToDiscord('Error `Missing poison data` in `playFighterTurn`.', { fightData: fightData });
									throw new Error('Missing poison data');
								}

								// Register the hp lost from poison
								loseHp(fightData, fighter, poisonedBy.damage, LifeEffect.Poison);
								break;
							}
							case Status.BURNED: {
								// Check if fighter is burned
								const burnedBy = fighter.burnedBy;

								if (!burnedBy) {
									sendJSONToDiscord('Error `Missing burn data` in `playFighterTurn`.', { fightData: fightData });
									throw new Error('Missing burn data');
								}

								// Get burner
								const burner = fightData.fighters.find(f => f.id === burnedBy.id);

								if (!burner) {
									sendJSONToDiscord('Error `Burner not found` in `playFighterTurn`.', { fightData: fightData });
									throw new Error('Burner not found');
								}

								// Register the hp lost from burn
								loseHp(fightData, fighter, burnedBy.damage, LifeEffect.Fire);
								break;
							}
							case Status.HEALING: {
								// Heal 1 HP
								heal(fightData, fighter, 1, undefined, LifeEffect.Heal);
								break;
							}
							case Status.TORCHED: {
								loseHp(fightData, fighter, 1, LifeEffect.Fire);
								break;
							}
							default: {
								break;
							}
						}
						status.timeSinceLastCycle = 0;
					}
				}

				if (status.time <= 0) {
					removeStatus(fightData, fighter, status.type);
				}
			});
		});
	}

	checkDeaths(fightData);

	// Abort if the attacker that was just picked died from a status
	if (attacker.hp <= 0) {
		return;
	}

	if (fightData.loser) {
		return;
	}

	// If the last fighter that played is different than the current fighter, reset both combo counts
	if (fightData.lastFighterId !== undefined && fightData.lastFighterId !== attacker.id) {
		const lastFighter = fightData.fighters.find(f => f.id === fightData.lastFighterId);
		if (lastFighter) {
			lastFighter.comboCounter = 0;
		}
		attacker.comboCounter = 0;
	}

	fightData.lastFighterId = attacker.id;
	attacker.comboCounter++;

	// Note: combo counter seems to work weirdly, or may be not
	// Pass turn if the fighter exceeded the combo limit, or does not meet a minimum of energy
	if (attacker.comboCounter >= MAXIMUM_COMBO_COUNT || attacker.energy < MINIMUM_ENERGY_TO_ACT) {
		fightData.steps.push({
			action: 'tired',
			fighter: stepFighter(attacker)
		});
		endTurnChecks(fightData, attacker);
		return;
	}

	// Event activation
	const possibleEvent = randomlyGetEvent(fightData, attacker);
	if (possibleEvent) {
		activateEvent(fightData, possibleEvent);
		checkDeaths(fightData);
		if (fightData.loser) {
			return;
		}
	}

	// Skill activation
	// Unless specified, pick a random skill by default.
	const possibleSkill = attacker.nextSkill ?? randomlyGetSkill(fightData, attacker);
	if (possibleSkill) {
		// End turn if skill activated
		if (activateSkill(fightData, possibleSkill)) {
			endTurnChecks(fightData, attacker);
			return;
		}
	}

	// TODO rework
	// // Sorceror's Wand replaces attacks
	// if (attacker.items.some(item => item.itemId === Item.SORCERERS_STICK)) {
	// 	attackSingleOpponent(fightData, attacker, itemList.SORCERERS_STICK, null);
	// 	endTurnChecks(fightData, attacker);
	// 	return;
	// }

	// No assaults for NO_ASSAULT
	if (hasStatus(attacker, Status.NO_ASSAULT)) {
		endTurnChecks(fightData, attacker);
		return;
	}

	// At this point this is an assault
	// Fighter attacks opponent
	launchAssault(fightData, attacker, true);
	// Remove an extra 4 energy for the assault
	setEnergy(attacker, attacker.energy - 4);

	endTurnChecks(fightData, attacker);
};
