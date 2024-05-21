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
import { InitStepFighter, LeaveAnimation, SkillActivateStep, StepFighter } from '@drpg/core/models/fight/FightStep';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { monsterList } from '@drpg/core/models/fight/MonsterList';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import {
	BASE_ENERGY_COST,
	CYCLE,
	DEFAULT_MAX_ENERGY,
	ENERGY_RECOVERY_BASE_FACTOR,
	MAXIMUM_MAX_ENERGY,
	TIME_BASE,
	TIME_FACTOR
} from './fightConstants.js';
import { DetailedFight } from './generateFight.js';
import { applyBalanceDamage, getBasicElementDamage, getDamage } from './getDamage.js';
import { cloneDinoz, initializeMonster } from './getFighters.js';
import randomBetween from './randomBetween.js';
import weightedRandom from './weightedRandom.js';
import { bossList } from '@drpg/core/models/fight/BossList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { FightStats } from '@drpg/core/models/fight/FightResult';
import { sendJSONToDiscord } from '../discord.js';
import { ErrorFormator } from '../errorFormator.js';
import { LifeEffect } from '@drpg/core/models/fight/transpiler';

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

export const getOpponents = (fightData: DetailedFight, fighter: DetailedFighter, limitTypes?: FighterType[]) => {
	let opponents = [];

	// Remove dead and escaped fighters and same team
	opponents = fightData.fighters.filter(f => f.hp > 0 && !f.escaped && f.attacker !== fighter.attacker);

	if (limitTypes?.length) {
		opponents = opponents.filter(f => limitTypes.includes(f.type));
	}

	return opponents;
};

const chooseRandomOpponent = (fighter: DetailedFighter, opponents: DetailedFighter[]) => {
	// Same target if CONCENTRATION
	if (fighter.skills.find(skill => skill.id === Skill.CONCENTRATION)) {
		if (fighter.previousTarget) {
			const target = opponents.find(opponent => opponent.id === fighter.previousTarget);

			if (target) {
				return target;
			}
		}
	}

	// Find best target based on defense if ANALYSE
	if (fighter.skills.find(skill => skill.id === Skill.ANALYSE)) {
		let worstDefense = Infinity;
		let opponentWithWorstDefense: DetailedFighter | null = null;

		opponents.forEach(opponent => {
			const defense = opponent.stats.defense[fighter.element];

			if (defense < worstDefense) {
				worstDefense = defense;
				opponentWithWorstDefense = opponent;
			}
		});

		if (!opponentWithWorstDefense) {
			sendJSONToDiscord('Error `No best defense opponent found` in `chooseRandomOpponent`.', {
				fighter: fighter,
				opponents: opponents
			});
			throw new Error('No best defense opponent found');
		}

		return opponentWithWorstDefense;
	}

	// Target lowest HP opponent if Skill.SANS_PITIE
	if (fighter.skills.find(skill => skill.id === Skill.SANS_PITIE)) {
		let lowestHp = Infinity;
		let lowestHpOpponent: DetailedFighter | null = null;

		opponents.forEach(opponent => {
			if (opponent.hp < lowestHp) {
				lowestHp = opponent.hp;
				lowestHpOpponent = opponent;
			}
		});

		if (!lowestHpOpponent) {
			sendJSONToDiscord('Error `No lowest HP opponent found` in `chooseRandomOpponent`.', {
				fighter: fighter,
				opponents: opponents
			});
			throw new Error('No lowest HP opponent found');
		}

		return lowestHpOpponent;
	}

	// Prioritize dinoz with Rock skill
	const withRock = opponents.filter(opponent => opponent.skills.find(skill => skill.id === Skill.ROCK));

	if (withRock.length) {
		const random = randomBetween(0, withRock.length - 1);

		return withRock[random];
	}

	if (!opponents.length) {
		return null;
	}

	const random = randomBetween(0, opponents.length - 1);

	return opponents[random];
};

export const getLimitedRandomOpponent = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	limitTypes?: FighterType[]
) => {
	const opponents = getOpponents(fightData, fighter, limitTypes);

	return chooseRandomOpponent(fighter, opponents);
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

	const randomOpponent = chooseRandomOpponent(fighter, opponents);

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
	stat: keyof Omit<FightStats, 'elements'> | 'el.damage' | 'el.attacks',
	value: number,
	element?: ElementType
) => {
	const stats = fighter.attacker ? fightData.stats.attack : fightData.stats.defense;

	if (stat === 'el.damage') {
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

		stats.elements[element].damage += value;
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

	stats[stat] += value;
};

export const setEnergy = (fighter: DetailedFighter, new_energy: number, fightData: DetailedFight) => {
	let delta = 0;
	if (new_energy > fighter.maxEnergy) {
		delta = fighter.maxEnergy - fighter.energy;
		fighter.energy = fighter.maxEnergy;
	} else if (new_energy < 0) {
		fighter.energy = 0;
	} else {
		delta = new_energy - fighter.energy;
		fighter.energy = new_energy;
	}
	if (delta > 0) {
		fightData.steps.push({
			action: 'gainEnergy',
			fighter: stepFighter(fighter),
			energy: fighter.energy
		});
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

		return Math.random() > 0.5 ? 1 : -1;
	});

	// Go through each event and roll the dice
	for (let i = 0; i < events.length; i++) {
		const event = events[i];

		// Check if event is a skill
		if ('id' in event) {
			// Skip if not enough energy
			if (fighter.energy < event.energy) continue;
		}

		if (randomBetween(1, 100) < (event.probability ?? 0)) {
			return event;
		}
	}

	return null;
};

const randomlyGetSkill = (fighter: DetailedFighter) => {
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

		return Math.random() > 0.5 ? 1 : -1;
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

		if (randomBetween(1, 100) < probability) {
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

const registerHit = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	opponents: DetailedFighter[],
	damage: number,
	damageElements: ElementType[] = [],
	skill?: Skill,
	skillStep?: SkillActivateStep
) => {
	const actualDamage: Record<number, number> = opponents.reduce(
		(acc, opponent) => ({
			...acc,
			[opponent.id]: damage
		}),
		{}
	);

	opponents.forEach(opponent => {
		/**
		 * PRE-DAMAGE
		 */

		// Reduce damage by bulle percentage
		if (
			// Opponent has BULLE
			opponent.stats.special.bubbleRate > 1 &&
			// Don't trigger on assaults and invocations
			skill &&
			skillList[skill].type !== SkillType.I &&
			// Don't trigger for bosses
			fighter.type !== 'boss' &&
			// Don't trigger for WOOD
			!damageElements.includes(ElementType.WOOD) &&
			// Don't trigger for VOID
			!damageElements.includes(ElementType.VOID)
		) {
			actualDamage[opponent.id] = Math.round(damage * (opponent.stats.special.bubbleRate - 1));

			if (actualDamage[opponent.id] < damage) {
				// Add resist step
				fightData.steps.push({
					action: 'resist',
					dinoz: stepFighter(opponent)
				});
			}
		}

		// 5% chance to reduce damage by 5 if Skill.CUIRASSE
		if (opponent.skills.find(s => s.id === Skill.CUIRASSE)) {
			const random = Math.random();

			if (random < 0.05) {
				actualDamage[opponent.id] = Math.max(actualDamage[opponent.id] - 5, 0);

				// Add resist step
				fightData.steps.push({
					action: 'resist',
					dinoz: stepFighter(opponent)
				});
			}
		}

		// Check for mud wall
		if (opponent.mudWall) {
			const tempDamage = actualDamage[opponent.id];
			actualDamage[opponent.id] -= opponent.mudWall;
			opponent.mudWall -= tempDamage;

			if (opponent.mudWall <= 0) {
				opponent.mudWall = undefined;

				// Add skillExpire step
				fightData.steps.push({
					action: 'skillExpire',
					dinoz: stepFighter(opponent),
					skill: Skill.MUR_DE_BOUE
				});
			}
		}

		// M_RESISTANCE
		if (opponent.skills.find(s => s.id === Skill.M_RESISTANCE)) {
			// 0 damage if skill
			if (skill) {
				actualDamage[opponent.id] = 0;

				// Add skill step
				fightData.steps.push({
					action: 'skillActivate',
					fid: opponent.id,
					skill,
					targets: []
				});
			}
		}

		// M_PROTECTION
		if (opponent.skills.find(s => s.id === Skill.M_PROTECTION)) {
			// Only tak 1/3 damage on assaults
			if (!skill) {
				actualDamage[opponent.id] = Math.round(actualDamage[opponent.id] / 3);
			}
		}

		// M_ELEMENTAL
		if (opponent.skills.find(s => s.id === Skill.M_ELEMENTAL)) {
			if (damageElements.includes(opponent.element)) {
				// Negate damage
				actualDamage[opponent.id] = 0;
			} else {
				// Take 29 + 0-3 damage
				const random = randomBetween(0, 3);

				actualDamage[opponent.id] = 29 + random;
			}
		}

		// M_DISABLE
		if (actualDamage[opponent.id] && opponent.skills.find(s => s.id === Skill.M_DISABLE)) {
			actualDamage[opponent.id] = 1;
		}

		/**
		 * DAMAGE
		 */
		opponent.hp -= actualDamage[opponent.id];

		if (skillStep) {
			const skillTarget = skillStep.targets.find(t => t.tid === opponent.id);
			if (!skillTarget) throw new ErrorFormator(500, `Target ${opponent.id} doesn't exist in ${skillStep.targets}`);
			skillTarget.damages = actualDamage[opponent.id];
		} else {
			// Add hit step
			fightData.steps.push({
				action: 'hit',
				fighter: stepFighter(fighter),
				target: stepFighter(opponent),
				damage: actualDamage[opponent.id],
				elements: damageElements,
				skill
			});
		}

		// Damage stats
		damageElements.forEach(element => {
			updateStat(fightData, fighter, 'el.damage', actualDamage[opponent.id], element);
			updateStat(fightData, fighter, 'el.attacks', 1, element);
		});
		updateStat(fightData, opponent, 'damageReceived', actualDamage[opponent.id]);

		/**
		 * POST-DAMAGE
		 */

		// Danger detector (prevent hit if damage > 25)
		if (opponent.items.some(item => item.itemId === Item.DANGER_DETECTOR) && actualDamage[opponent.id] > 25) {
			// Add item use step
			fightData.steps.push({
				action: 'itemUse',
				fighter: stepFighter(opponent),
				itemId: Item.DANGER_DETECTOR
			});

			// Add to items used
			opponent.itemsUsed.push(Item.DANGER_DETECTOR);

			// Get item index
			const itemIndex = opponent.items.findIndex(item => item.itemId === Item.DANGER_DETECTOR);

			// Remove from items
			opponent.items.splice(itemIndex, 1);

			// Restore HP
			opponent.hp += actualDamage[opponent.id];

			actualDamage[opponent.id] = 0;
		}

		// Wake up:
		// Without Amazonie, wake up if the target lost at least 1 hp
		// With Amazonie, wake up if the target lost at least 11 hp
		if (
			(fightData.environment?.type !== Skill.AMAZONIE && actualDamage[opponent.id] > 0) ||
			(fightData.environment?.type === Skill.AMAZONIE && actualDamage[opponent.id] > 10)
		) {
			removeStatus(fightData, opponent, Status.ASLEEP);
		}

		// Intangible
		if (hasStatus(opponent, Status.INTANGIBLE) && actualDamage[opponent.id]) {
			removeStatus(fightData, opponent, Status.INTANGIBLE);
		}

		// Survive with 1 HP if canSurvive
		if (opponent.canSurvive && opponent.hp <= 1) {
			opponent.canSurvive = false;
			opponent.hp = 1;

			// Add survival step
			fightData.steps.push({
				action: 'survive',
				dinoz: stepFighter(opponent)
			});
		}

		// Dimensional powder item

		// Check if any fighter has Item.DIMENSIONAL_POWDER
		const dimensionalPowderUser = getFighters(fightData).find(f =>
			f.items.some(item => item.itemId === Item.DIMENSIONAL_POWDER)
		);

		if (dimensionalPowderUser) {
			// Add item use step
			fightData.steps.push({
				action: 'itemUse',
				fighter: stepFighter(dimensionalPowderUser),
				itemId: Item.DIMENSIONAL_POWDER
			});

			// Escape opponent if HP requirement is met
			if (opponent.startingHp > 10 && opponent.hp > 0 && opponent.hp < 10) {
				// Add leave step
				fightData.steps.push({
					action: 'leave',
					fighter: stepFighter(opponent),
					animation: LeaveAnimation.BLACKHOLE
				});

				opponent.escaped = true;
			}
		}

		// LIFE_STEALER
		if (
			actualDamage[opponent.id] &&
			opponent.hp < 20 &&
			!hasStatus(opponent, Status.STOLE_LIFE) &&
			opponent.items.some(item => item.itemId === Item.LIFE_STEALER)
		) {
			// Steal 30 HP from a random opponent
			const randomOpponent = getRandomOpponent(fightData, opponent);

			// Add item use step
			fightData.steps.push({
				action: 'itemUse',
				fighter: stepFighter(opponent),
				itemId: Item.LIFE_STEALER
			});

			registerHit(fightData, opponent, [randomOpponent], 30);

			heal(fightData, opponent, 30);

			// Add status
			addStatus(fightData, opponent, Status.STOLE_LIFE);
		}

		// Remove costume if fire damage
		if (opponent.costume && damage && damageElements.includes(ElementType.FIRE)) {
			// Take 3 damage
			registerHit(fightData, opponent, [opponent], 3);

			// Add leave step
			fightData.steps.push({
				action: 'leave',
				fighter: stepFighter(opponent)
			});

			// Add remove costume step
			fightData.steps.push({
				action: 'removeCostume',
				fighter: stepFighter(opponent)
			});

			opponent.costume = undefined;

			// Add arrive step
			fightData.steps.push({
				action: 'arrive',
				fid: opponent.id
			});
		}

		// Qi Gong
		if (actualDamage[opponent.id] && fighter.skills.some(skill => skill.id === Skill.QI_GONG)) {
			// 30% Chance to deplete energy
			if (Math.random() < 0.3) {
				const energyTransferred = Math.max(fighter.maxEnergy - fighter.energy, opponent.energy);
				opponent.energy = 0;
				setEnergy(fighter, fighter.energy + energyTransferred, fightData);

				// Add reduce energy step
				fightData.steps.push({
					action: 'reduceEnergy',
					fighter: stepFighter(opponent)
				});

				// Add gain energy step
				fightData.steps.push({
					action: 'gainEnergy',
					fighter: stepFighter(fighter),
					energy: energyTransferred
				});
			}
		}

		// Skill.VIDE_ENERGETIQUE
		if (actualDamage[opponent.id] && opponent.skills.some(skill => skill.id === Skill.VIDE_ENERGETIQUE)) {
			// 1/6 Chance to reduce energy recovery
			if (randomBetween(0, 5) === 0) {
				fighter.stats.special.energyRecovery *= 0.85;

				// Add reduce energy step
				fightData.steps.push({
					action: 'reduceEnergy',
					fighter: stepFighter(fighter)
				});
			}
		}

		// Skill.SOURCE_DE_VIE
		if (actualDamage[opponent.id] && opponent.skills.some(skill => skill.id === Skill.SOURCE_DE_VIE)) {
			// 1/6 Chance to steal 5% HP
			if (randomBetween(0, 5) === 0) {
				const hpStolen = Math.round(opponent.hp * 0.05);

				registerHit(fightData, opponent, [fighter], hpStolen);
				heal(fightData, opponent, hpStolen);
			}
		}

		// Status.M_ABSORB
		if (actualDamage[opponent.id] && hasStatus(fighter, Status.M_ABSORB)) {
			// Heal damage done
			heal(fightData, fighter, actualDamage[opponent.id]);
		}

		// M_WORM
		if (opponent.absorbed && opponent.skills.some(skill => skill.id === Skill.M_WORM)) {
			// Heal damage absorbed
			heal(fightData, opponent, opponent.absorbed);

			opponent.absorbed = undefined;
		}

		// Spikes
		if (actualDamage[opponent.id] && opponent.spikes) {
			// Take spike damage on assaults
			if (!skill) {
				registerHit(fightData, opponent, [fighter], opponent.spikes, undefined, Skill.M_POISONED_PICKS);
				opponent.spikes += 1;
			}
		}

		// M_CONTAMINATION
		if (actualDamage[opponent.id] && opponent.skills.some(skill => skill.id === Skill.M_CONTAMINATION)) {
			// 1/6 Chance to poison on assaults
			if (!skill && randomBetween(0, 5) === 0) {
				poison(fightData, opponent, fighter, Skill.M_CONTAMINATION, StatusLength.SHORT);
			}
		}
	});
};

const evadedSkill = (fightData: DetailedFight, opponent: DetailedFighter, skill: SkillDetails) => {
	if (opponent.hp <= 0) return false;

	// Some statues prevent skill evasion
	const statusesPreventingEvasion = [Status.ASLEEP, Status.PETRIFIED, Status.FLYING, Status.STUNNED];
	if (statusesPreventingEvasion.some(status => hasStatus(opponent, status))) {
		return false;
	}

	let evasion = 0;

	// 10% chance to evade skills A with Skill.DEPLACEMENT_INSTANTANE
	if (skill.type === SkillType.A && opponent.skills.find(s => s.id === Skill.DEPLACEMENT_INSTANTANE)) {
		evasion += 0.1;
	}

	const random = Math.random();
	const evaded = random < evasion;

	// Evasion stat
	if (evaded) {
		updateStat(fightData, opponent, 'evasions', 1);
	}

	return evaded;
};


/// Triggers an attack of type assault, it targets a single target in close combat
/// By default, it is assumed that the assault is a normal one (not triggered from a skill)
const launchAssault = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	opponent: DetailedFighter,
	disallowCombo?: boolean,
	skill?: Skill,
	power?: number,
	skillStep?: SkillActivateStep
) => {
	// Trigger fighter attack
	let hitAtLeastOnce = attackTarget(fightData, fighter, opponent, true, skill, power, skillStep);

	// Consume energy
	setEnergy(fighter, fighter.energy - BASE_ENERGY_COST, fightData);

	// Get combo chances
	const combo = fighter.stats.special.multihit - 1;

	let comboCount = 1;

	// Repeat attack only if not countering
	if (!disallowCombo) {
		let random = Math.random();
		while (random < combo && comboCount <= 10) {
			// Trigger fighter attack
			const hit = attackTarget(fightData, fighter, opponent, true, skill, power);

			hitAtLeastOnce = hitAtLeastOnce || hit;

			// Consume energy
			setEnergy(fighter, fighter.energy - (BASE_ENERGY_COST + comboCount), fightData);

			// Multihit stat
			updateStat(fightData, fighter, 'multiHits', 1);

			random = Math.random();
			comboCount++;
		}
	}

	return !!hitAtLeastOnce;
};

/// Triggers an attack from a skill that targets a single fighter
const attackSingleOpponent = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	skillOrItem: SkillDetails | ItemFiche,
	step: SkillActivateStep | null
) => {
	// Get random opponent
	const opponent = getRandomOpponent(fightData, fighter);

	// Add target
	if (step) {
		step.targets.push({ tid: opponent.id });
	}

	// Skill
	if ('id' in skillOrItem) {
		const skill = skillOrItem;

		// Check if opponent evaded
		if (evadedSkill(fightData, opponent, skill)) {
			// Add evade step
			fightData.steps.push({
				action: 'evade',
				fighter: stepFighter(opponent)
			});

			return;
		}

		// Get damage
		const { damage, elements } = getDamage(fighter, opponent, skill.id);

		// Register the hit
		registerHit(fightData, fighter, [opponent], damage, elements, skill.id);

		return opponent;
	}

	// Item
	const { damage, elements } = getDamage(fighter, opponent, undefined, skillOrItem.itemId);

	// Register the hit
	registerHit(fightData, fighter, [opponent], damage, elements);

	return opponent;
};


/// Triggers an attack from a skill that targets multiple (not all??) fighter
const attackMultipleOpponents = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	opponents: DetailedFighter[],
	skill: SkillDetails,
	step: SkillActivateStep
) => {
	opponents.forEach(opponent => {
		// Add target
		step.targets.push({ tid: opponent.id });

		// Check if opponent evaded
		if (evadedSkill(fightData, opponent, skill)) {
			// Add evade step
			fightData.steps.push({
				action: 'evade',
				fighter: stepFighter(opponent)
			});

			return;
		}

		// Get damage
		const { damage, elements } = getDamage(fighter, opponent, skill.id);

		// Register the hit
		registerHit(fightData, fighter, [opponent], damage, elements, skill.id);
	});
};

/// Triggers an attack from a skill that targets all fighters of the opposing team
const attackAllOpponents = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	skill: SkillDetails,
	step: SkillActivateStep,
	count?: number
) => {
	// Attack each opponent
	const opponents = getOpponents(fightData, fighter);

	// Reduce the list of impacted of opponents to a random count only if a specific count is impacted
	if (count) {
		while (opponents.length > count) {
			const random_index = Math.round(Math.random() * opponents.length);
			opponents.splice(random_index, 1);
		}
	}

	opponents.forEach(opponent => {
		// Add target
		step.targets.push({ tid: opponent.id });

		// Check if opponent evaded
		if (evadedSkill(fightData, opponent, skill)) {
			// Add evade step
			fightData.steps.push({
				action: 'evade',
				fighter: stepFighter(opponent)
			});

			return;
		}

		// Get damage
		const { damage, elements } = getDamage(fighter, opponent, skill.id);

		// Register the hit
		registerHit(fightData, fighter, [opponent], damage, elements, skill.id);
	});
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
		fightData.place
	);

	monster.master = fighter.id;

	// Adjust time
	monster.time = fighter.time;

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
		const step: SkillActivateStep = {
			action: 'skillActivate',
			fid: fighter.id,
			skill: event.id,
			targets: []
		};

		// Add skillActivate step
		fightData.steps.push(step);

		switch (event.id) {
			// AIR
			case Skill.VENT_VIF: {
				addStatus(fightData, fighter, Status.QUICKENED, StatusLength.SHORT);
				break;
			}
			case Skill.AIGUILLON: {
				attackSingleOpponent(fightData, fighter, event, step);
				break;
			}
			// FIRE
			case Skill.COMBUSTION:
			case Skill.BRASERO: {
				attackAllOpponents(fightData, fighter, event, step);
				break;
			}
			case Skill.COLERE: {
				fighter.nextAssaultMultiplier *= 1.25;

				// Add to active skills
				fighter.activeSkills.push(event.id);
				break;
			}
			// LIGHTNING
			case Skill.AURA_HERMETIQUE: {
				addStatus(fightData, fighter, Status.SHIELDED);
				break;
			}
			case Skill.BENEDICTION: {
				addStatus(fightData, fighter, Status.BLESSED, StatusLength.MEDIUM);
				break;
			}
			case Skill.FOCUS: {
				fighter.nextAssaultBonus += fighter.stats.base[ElementType.LIGHTNING];
				break;
			}
			case Skill.PUREE_SALVATRICE: {
				// Remove all the bad status of the group
				getAllies(fightData, fighter).forEach(fighter => {
					removeStatus(fightData, fighter, ...fighter.status.filter(s => BadStatus.includes(s.type)).map(s => s.type));
				});
				break;
			}
			// WATER
			case Skill.DOUCHE_ECOSSAISE: {
				attackAllOpponents(fightData, fighter, event, step);
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
				const opponent = opponents[randomBetween(0, opponents.length - 1)];

				// Lock that opponent to a random element
				opponent.element = opponent.elements[Math.round(Math.random() * opponent.elements.length)];
				addStatus(fightData, opponent, Status.LOCKED, StatusLength.MEDIUM);
				break;
			}
			case Skill.HYPERVENTILATION: {
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
				step.targets.push({ tid: opponent.id });

				if (!hasStatus(opponent, Status.FLYING)) {
					// Increase the opponent's time
					opponent.time += 15 * TIME_FACTOR;
				}
				break;
			}
			case Skill.RESISTANCE_A_LA_MAGIE: {
				// Remove all bad status
				removeStatus(fightData, fighter, ...fighter.status.filter(s => BadStatus.includes(s.type)).map(s => s.type));
				break;
			}
			case Skill.ETAT_PRIMAL: {
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
				fighter.nextAssaultMultiplier *= 2;
				break;
			}
			case Skill.PRINTEMPS_PRECOCE: {
				// Heal all allies
				getAllies(fightData, fighter).forEach(f => {
					// Skip self
					if (f.id === fighter.id) return;

					// Heal 1-wood HP
					heal(fightData, f, randomBetween(1, fighter.stats.base[ElementType.WOOD]));
				});
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

				// Protect lowest HP ally
				fighter.protecting = lowestHpAlly.id;
				break;
			}
			case Skill.COURBATURES: {
				const opponent = getRandomOpponent(fightData, fighter);

				// Add target
				step.targets.push({ tid: opponent.id });

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
				break;
			}
			case Skill.BERSERK: {
				// Remove all skills and events
				fighter.skills = [];
				fighter.items = [];

				const fire = getBasicElementDamage(fighter, ElementType.FIRE);
				const water = getBasicElementDamage(fighter, ElementType.WATER);
				const wood = getBasicElementDamage(fighter, ElementType.WOOD);
				const lightning = getBasicElementDamage(fighter, ElementType.LIGHTNING);
				const air = getBasicElementDamage(fighter, ElementType.AIR);

				// x2 to assault damages
				fighter.stats.assaultBonus[ElementType.FIRE] += fire;
				fighter.stats.assaultBonus[ElementType.WATER] += water;
				fighter.stats.assaultBonus[ElementType.WOOD] += wood;
				fighter.stats.assaultBonus[ElementType.LIGHTNING] += lightning;
				fighter.stats.assaultBonus[ElementType.AIR] += air;

				break;
			}
			case Skill.BANNI_DES_DIEUX: {
				// Get random opponent
				const opponent = getRandomOpponent(fightData, fighter);

				// Add target
				step.targets.push({ tid: opponent.id });

				// Disable invocations
				addStatus(fightData, opponent, Status.NO_INVOCATION);
				break;
			}
			case Skill.THERAPIE_DE_GROUPE: {
				addStatus(fightData, fighter, Status.COPY_HEAL);
				break;
			}
			case Skill.MORSURE_DU_SOLEIL: {
				// Get random opponent
				const opponent = getRandomOpponent(fightData, fighter);

				// Add target
				step.targets.push({ tid: opponent.id });

				addStatus(fightData, opponent, Status.DAZZLED, StatusLength.MEDIUM);
				break;
			}
			case Skill.CRAMPE_CHRONIQUE: {
				setEnergy(fighter, fighter.energy - 10, fightData);
				fighter.stats.special.energyRecovery *= 0.85;

				// Add reduce energy step
				fightData.steps.push({
					action: 'reduceEnergy',
					fighter: stepFighter(fighter)
				});
				break;
			}
			case Skill.MAINS_COLLANTES: {
				// Get random opponent
				const opponent = getRandomOpponent(fightData, fighter);

				// Add target
				step.targets.push({ tid: opponent.id });

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
					// Change team
					clone.attacker = !clone.attacker;
				});
				break;
			}
			case Skill.FRENESIE_COLLECTIVE: {
				getAllies(fightData, fighter).forEach(ally => {
					addStatus(fightData, ally, Status.QUICKENED, StatusLength.MEDIUM);
				});
				break;
			}
			// MONSTER
			case Skill.M_REGENERATION: {
				if (fighter.hp >= fighter.startingHp) {
					return cancel();
				}

				heal(fightData, fighter, Math.round(fighter.startingHp * 0.1));
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
				let randomElement = fighter.element;

				while (fighter.element === randomElement) {
					randomElement = randomBetween(1, 6) as ElementType;
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
				// Get all opponent dinoz
				const opponents = getOpponents(fightData, fighter, ['dinoz']);

				attackMultipleOpponents(fightData, fighter, opponents, event, step);
				break;
			}
			case Skill.M_HEAL_GROUP: {
				getAllies(fightData, fighter).forEach(ally => {
					// Heal 1 HP
					heal(fightData, ally, 1);
				});

				// Get dead allies
				const deadAllies = fightData.fighters.filter(f => f.attacker === fighter.attacker && f.hp <= 0);

				// Revive all dead allies
				deadAllies.forEach(ally => {
					// Reset HP to 0 in case it was negative
					ally.hp = 0;

					heal(fightData, ally, 1);

					// Add revive step
					fightData.steps.push({
						action: 'revive',
						fighter: stepFighter(ally)
					});
				});
				break;
			}
			case Skill.M_UNTOUCHABLE: {
				const tangibleAllies = getAllies(fightData, fighter).filter(f => !hasStatus(f, Status.INTANGIBLE));

				if (!tangibleAllies.length) {
					return cancel();
				}

				// Get random ally
				const ally = tangibleAllies[randomBetween(0, tangibleAllies.length - 1)];

				// Add status
				addStatus(fightData, ally, Status.INTANGIBLE, StatusLength.MEDIUM);
				break;
			}
			case Skill.M_FASTER: {
				getAllies(fightData, fighter).forEach(ally => {
					// Add to targets
					step.targets.push({ tid: ally.id });

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
				const ally = nonFlyingAllies[randomBetween(0, nonFlyingAllies.length - 1)];

				// Add status
				addStatus(fightData, ally, Status.FLYING);
				break;
			}
			default:
				// Remove last step
				fightData.steps.pop();

				return false;
		}

		// Consume energy
		setEnergy(fighter, fighter.energy - event.energy, fightData);
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
				heal(fightData, fighter, 10);
				break;
			}
			case Item.FIGHT_RATION: {
				let hpDelta = 20 - (fighter.startingHp - fighter.hp);

				if (hpDelta < 0) hpDelta = 0;

				// Less chance to heal if lost HP is less than 20. Sure to heal if lost HP is 20+
				if (fighter.hp === fighter.startingHp || randomBetween(0, hpDelta) !== 0) {
					return cancel();
				}

				// Heal 20 HP
				heal(fightData, fighter, 20);
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
				heal(fightData, fighter, 1 + item.hp);
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

				// Lock element
				addStatus(fightData, fighter, Status.LOCKED);
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
				const opponentDefender = opponentsWithoutAttacker[randomBetween(0, opponentsWithoutAttacker.length - 1)];

				// Add moveTo step
				fightData.steps.push({
					action: 'moveTo',
					fid: opponentAttacker.id,
					tid: opponentDefender.id
				});

				// Attack defender
				launchAssault(fightData, opponentAttacker, opponentDefender, true);

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
				if (fighter.hp === fighter.startingHp || randomBetween(0, hpDelta) !== 0) {
					return cancel();
				}

				// Heal 40 HP
				heal(fightData, fighter, 40);
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
			const random = Math.random();

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
			fighter.time += Infinity;
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
			fighter.time += Infinity;
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
				fighter.time = fightData.time + randomBetween(0, TIME_BASE * TIME_FACTOR);
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
				fighter.time = fightData.time;
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

	const step: SkillActivateStep = {
		action: 'skillActivate',
		fid: fighter.id,
		skill: skill.id,
		targets: []
	};

	// Add skillActivate step
	fightData.steps.push(step);

	// Cancel method to use if the skil ends up not being triggered
	const cancel = () => {
		// Remove last step
		fightData.steps.pop();

		return false;
	};

	switch (skill.id) {
		// Simple multi-target skills
		// FIRE
		case Skill.SOUFFLE_ARDENT:
		case Skill.METEORES:
		case Skill.CREPUSCULE_FLAMBOYANT:
		// AIR
		case Skill.MISTRAL:
		// MONSTER
		case Skill.M_COMET:
		case Skill.M_VENERABLE:
		case Skill.M_GRIZOU: {
			attackAllOpponents(fightData, fighter, skill, step);
			break;
		}

		// Simple single-target skills
		// FIRE
		case Skill.BOULE_DE_FEU:
		case Skill.COULEE_DE_LAVE:
		// LIGHTNING
		case Skill.FOUDRE:
		// WATER
		case Skill.CANON_A_EAU:
		// WOOD
		case Skill.LANCER_DE_ROCHE:
		case Skill.LANCEUR_DE_GLAND:
		// AIR
		case Skill.DISQUE_VACUUM:
		// RACE
		case Skill.CHARGE_PIGMOU:
		// MONSTER
		case Skill.M_WORM_2:
		case Skill.M_AIR_BLADE: {
			attackSingleOpponent(fightData, fighter, skill, step);
			break;
		}

		// Other skills
		case Skill.CATCH: {
			// Get monster opponents
			const opponents = getOpponents(fightData, fighter, ['monster']);

			// Cancel if no monster opponents
			if (!opponents.length) {
				return cancel();
			}

			// Get random opponent
			const monster = opponents[randomBetween(0, opponents.length - 1)];

			// Attack opponent
			const hit = launchAssault(fightData, fighter, monster, true);

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
		// AIR
		case Skill.ENVOL: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			step.targets.push({ tid: opponent.id });

			// Add moveTo step
			fightData.steps.push({
				action: 'moveTo',
				fid: fighter.id,
				tid: opponent.id
			});

			// Attack opponent
			launchAssault(fightData, fighter, opponent, true);

			// Check if fighter is not dead
			if (fighter.hp > 0) {
				addStatus(fightData, fighter, Status.FLYING);

				// Add moveBack step
				fightData.steps.push({
					action: 'moveBack',
					fid: fighter.id
				});
			}
			break;
		}
		case Skill.TORNADE: {
			getOpponents(fightData, fighter).forEach(opponent => {
				// Cancel FLYING
				removeStatus(fightData, opponent, Status.FLYING);
			});

			attackAllOpponents(fightData, fighter, skill, step);
			break;
		}
		case Skill.ATTAQUE_PLONGEANTE: {
			fighter.nextAssaultBonus += 2 * fighter.stats.base[ElementType.AIR];

			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			step.targets.push({ tid: opponent.id });

			// Attack opponent
			launchAssault(fightData, fighter, opponent, true);

			// Check if fighter is not dead
			if (fighter.hp > 0) {
				// Add moveBack step
				fightData.steps.push({
					action: 'moveBack',
					fid: fighter.id
				});
			}
			break;
		}
		case Skill.NUAGE_TOXIQUE: {
			getOpponents(fightData, fighter).forEach(opponent => {
				// Poison
				poison(fightData, opponent, fighter, Skill.NUAGE_TOXIQUE, StatusLength.MEDIUM);
			});
			break;
		}
		case Skill.PAUME_EJECTABLE: {
			// x2 damage
			fighter.nextAssaultMultiplier *= 2;

			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			step.targets.push({ tid: opponent.id });

			// Add moveTo step
			fightData.steps.push({
				action: 'moveTo',
				fid: fighter.id,
				tid: opponent.id
			});

			// Attack opponent
			const hit = launchAssault(fightData, fighter, opponent, true);

			// Check if fighter is not dead
			if (fighter.hp > 0) {
				addStatus(fightData, fighter, Status.FLYING);

				// Add moveBack step
				fightData.steps.push({
					action: 'moveBack',
					fid: fighter.id
				});
			}

			if (hit) {
				// Increase time
				fighter.time += 15 * TIME_FACTOR;
			}
			break;
		}
		// FIRE
		case Skill.PAUME_CHALUMEAU: {
			attackSingleOpponent(fightData, fighter, skill, step);

			// Increase time
			fighter.time += 15 * TIME_FACTOR;
			break;
		}
		case Skill.KAMIKAZE: {
			// const skillTarget = attackSingleOpponent(fightData, fighter, skill, step);
			const opponent = getRandomOpponent(fightData, fighter);
			launchAssault(fightData, fighter, opponent, true, Skill.KAMIKAZE);

			// Loose 50% HP
			const hpLost = Math.round(fighter.hp / 2);
			fighter.hp -= hpLost;

			// Add looseHp step
			fightData.steps.push({
				action: 'looseHp',
				fid: fighter.id,
				hp: hpLost,
				fx: LifeEffect.Explode
			});
			break;
		}
		case Skill.SIESTE: {
			// Heal 1-20 HP
			heal(fightData, fighter, randomBetween(1, 20));

			// Fall asleep
			addStatus(fightData, fighter, Status.ASLEEP, StatusLength.SHORT);
			break;
		}
		case Skill.DETONATION: {
			// The fighter will not suicide with the skill, it just loses its roll
			if (fighter.hp > 5) {
				registerHit(fightData, fighter, [fighter], 5, [ElementType.FIRE], skill.id);
				// Increase the time of all other fighters to make it look like the caster "gained" time
				getFighters(fightData).forEach(f => {
					if (f.id !== fighter.id) {
						f.time += 15 * TIME_FACTOR;
					}
				});
			}
			break;
		}
		// LIGHTNING
		case Skill.AUBE_FEUILLUE: {
			// Heal each fighter of the caster's group
			const hpHealed = fighter.stats.base[ElementType.LIGHTNING] * 2 + fighter.stats.base[ElementType.WOOD] * 2;
			getAllies(fightData, fighter).forEach(ally => {
				heal(fightData, ally, hpHealed);
			});
			break;
		}
		case Skill.DANSE_FOUDROYANTE: {
			// Attack a random opponent 5 times

			// Get opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			step.targets.push({ tid: opponent.id });

			// Add moveTo step
			fightData.steps.push({
				action: 'moveTo',
				fid: fighter.id,
				tid: opponent.id
			});

			for (let i = 0; i < 5; i++) {
				// Fighter attacks opponent
				launchAssault(fightData, fighter, opponent, false, Skill.DANSE_FOUDROYANTE, 3);

				const countered = counterAttack(fightData, opponent);

				// If the opponent succeeds at countering, execute the counter
				if (countered) {
					// Add counter step
					fightData.steps.push({
						action: 'counter',
						fighter: stepFighter(opponent),
						opponent: stepFighter(fighter)
					});

					// Opponent attacks fighter
					launchAssault(fightData, opponent, fighter, true);
				}
			}

			// Check if fighter is not dead
			if (fighter.hp > 0) {
				// Add moveBack step
				fightData.steps.push({
					action: 'moveBack',
					fid: fighter.id
				});
			}
			break;
		}
		case Skill.ECLAIR_SINUEUX: {
			attackAllOpponents(fightData, fighter, skill, step, 3);
			break;
		}
		// WATER
		case Skill.COUP_SOURNOIS: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			step.targets.push({ tid: opponent.id });

			const hit = attackTarget(fightData, fighter, opponent, true);

			if (hit) {
				let damage = 0;

				// 0 damage if boss or Skill.PERCEPTION
				if (!opponent.skills.find(s => s.id === Skill.PERCEPTION) && opponent.type !== 'boss') {
					// 50% HP otherwise
					damage = applyBalanceDamage(opponent, Math.round(opponent.hp / 2));
				}

				registerHit(fightData, fighter, [opponent], damage, [], skill.id);
			}
			break;
		}
		case Skill.GEL: {
			const opponent = attackSingleOpponent(fightData, fighter, skill, step);

			if (opponent) {
				// Slow opponent
				addStatus(fightData, opponent, Status.SLOWED, StatusLength.MEDIUM);
			}
			break;
		}
		case Skill.COUP_FATAL: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			step.targets.push({ tid: opponent.id });

			const hit = attackTarget(fightData, fighter, opponent, true);

			if (hit) {
				let damage = 0;

				// 0 damage if boss or Skill.PERCEPTION
				if (!opponent.skills.find(s => s.id === Skill.PERCEPTION) && opponent.type !== 'boss') {
					// 100% HP otherwise
					damage = applyBalanceDamage(opponent, opponent.hp);
				}

				registerHit(fightData, fighter, [opponent], damage, [], skill.id);
			}
			break;
		}
		case Skill.MARECAGE: {
			const opponents = getOpponents(fightData, fighter);

			// Slow opponents
			opponents.forEach(opponent => {
				addStatus(fightData, opponent, Status.SLOWED, StatusLength.MEDIUM);
			});
			break;
		}
		case Skill.MOIGNONS_LIQUIDES: {
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			step.targets.push({ tid: opponent.id });

			opponent.time += 25 * TIME_FACTOR;
			break;
		}
		case Skill.PETRIFICATION: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			step.targets.push({ tid: opponent.id });

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
			attackAllOpponents(fightData, fighter, skill, step);

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
		case Skill.DELUGE: {
			attackAllOpponents(fightData, fighter, skill, step);
			// Increase time of all opponents by 5
			const opponents = getOpponents(fightData, fighter);
			opponents.forEach(opponent => {
				opponent.time += 8 * TIME_FACTOR;
			});
		}
		// WOOD
		case Skill.MUR_DE_BOUE: {
			// Add 30 HP mud wall
			fighter.mudWall = 30;
			break;
		}
		// AIR
		case Skill.TROU_NOIR: {
			// Prevent if item.ANTI_GRAVE_SUIT
			const opponentWithSuit = getOpponents(fightData, fighter).find(opponent =>
				opponent.items.some(item => item.itemId === Item.ANTI_GRAVE_SUIT)
			);

			if (opponentWithSuit) {
				// Add item use step
				fightData.steps.push({
					action: 'itemUse',
					fighter: stepFighter(opponentWithSuit),
					itemId: Item.ANTI_GRAVE_SUIT
				});

				return true;
			}

			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			step.targets.push({ tid: opponent.id });

			// Instantly cancel if boss
			if (opponent.type === 'boss') {
				return cancel();
			}

			// Add leave step
			fightData.steps.push({
				action: 'leave',
				fighter: stepFighter(opponent),
				animation: LeaveAnimation.BLACKHOLE
			});

			opponent.escaped = true;
			break;
		}
		// SPHERE
		case Skill.HYPNOSE: {
			// Get non boss opponents
			const opponents = getOpponents(fightData, fighter, ['dinoz', 'monster', 'clone']);

			if (!opponents.length) {
				return cancel();
			}

			// Get random opponent
			const opponent = opponents[randomBetween(0, opponents.length - 1)];

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
		case Skill.SECOUSSE: {
			// Get non flying enemies
			const opponents = getOpponents(fightData, fighter).filter(opponent => !hasStatus(opponent, Status.FLYING));

			opponents.forEach(opponent => {
				// Check if opponent evaded
				if (evadedSkill(fightData, opponent, skill)) {
					// Add evade step
					fightData.steps.push({
						action: 'evade',
						fighter: stepFighter(opponent)
					});

					return;
				}

				// Get damage
				const { damage, elements } = getDamage(fighter, opponent, Skill.SECOUSSE);

				// Register the hit
				registerHit(fightData, fighter, [opponent], damage, elements, Skill.SECOUSSE);
			});
			break;
		}
		case Skill.HERCOLUBUS: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackAllOpponents(fightData, fighter, skill, step);
			break;
		}
		case Skill.VULCAIN: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackAllOpponents(fightData, fighter, skill, step);
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

			attackSingleOpponent(fightData, fighter, skill, step);
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

			attackAllOpponents(fightData, fighter, skill, step);
			break;
		}
		case Skill.ONDINE: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackSingleOpponent(fightData, fighter, skill, step);
			break;
		}
		case Skill.LOUP_GAROU: {
			// Cancel if no invocations left
			if (fighter.invocations <= 0) {
				return cancel();
			}

			fighter.invocations -= 1;

			attackAllOpponents(fightData, fighter, skill, step);
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

			attackAllOpponents(fightData, fighter, skill, step);
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

			attackSingleOpponent(fightData, fighter, skill, step);
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

			attackSingleOpponent(fightData, fighter, skill, step);
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

			attackAllOpponents(fightData, fighter, skill, step);
			break;
		}
		case Skill.CRI_DE_GUERRE: {
			// Find strongest Skill
			const strongestSkill = fighter.skills.reduce((acc, skill) => {
				if (skill.type !== SkillType.A) return acc;

				if (SkillLevel[skill.id] > SkillLevel[acc.id]) {
					return skill;
				}

				// Random if same level
				if (SkillLevel[skill.id] === SkillLevel[acc.id]) {
					return randomBetween(0, 1) ? skill : acc;
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
			step.targets.push({ tid: opponent.id });

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

				// Add gain energy step
				fightData.steps.push({
					action: 'gainEnergy',
					fighter: stepFighter(ally),
					//TODO
					energy: 0
				});
			});
			break;
		}
		case Skill.EXTENUATION: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			step.targets.push({ tid: opponent.id });

			// Reduce energy recovery by 25%
			opponent.stats.special.energyRecovery *= 0.75;

			// Add reduce energy step
			fightData.steps.push({
				action: 'reduceEnergy',
				fighter: stepFighter(opponent)
			});
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
			step.targets.push({ tid: opponent.id });

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
			step.targets.push({ tid: opponent.id });

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
			step.targets.push({ tid: opponent.id });

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
			step.targets.push({ tid: opponent.id });

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
			const opponent = opponents[randomBetween(0, opponents.length - 1)];

			// Add leave step
			fightData.steps.push({
				action: 'leave',
				fighter: stepFighter(opponent),
				animation: LeaveAnimation.FLYING
			});

			opponent.escaped = true;
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
		case Skill.BIGMAGNON: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add target
			step.targets.push({ tid: opponent.id });

			// Attack opponent
			// TODO check if this is a close combat attack or not
			launchAssault(fightData, fighter, opponent, false);

			// Cancel FLYING and INTANGIBLE
			removeStatus(fightData, opponent, Status.FLYING, Status.INTANGIBLE);

			// Add STUNNED if not boss
			if (opponent.type !== 'boss') {
				addStatus(fightData, opponent, Status.STUNNED, StatusLength.MEDIUM);
			}

			break;
		}
		case Skill.ECRASEMENT: {
			const opponents = getOpponents(fightData, fighter).filter(opponent => !hasStatus(opponent, Status.FLYING));

			attackMultipleOpponents(fightData, fighter, opponents, skill, step);
			break;
		}
		// Monster skills
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
			// Add status
			addStatus(fightData, fighter, Status.M_ABSORB);

			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add moveTo step
			fightData.steps.push({
				action: 'moveTo',
				fid: fighter.id,
				tid: opponent.id
			});

			// Attack opponent
			launchAssault(fightData, fighter, opponent, false, Skill.M_ABSORPTION, 10);

			// Check if fighter is not dead
			if (fighter.hp > 0) {
				// Add moveBack step
				fightData.steps.push({
					action: 'moveBack',
					fid: fighter.id
				});
			}

			// Remove status
			removeStatus(fightData, fighter, Status.M_ABSORB);
			break;
		}
		case Skill.M_FLIGHT: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add moveTo step
			fightData.steps.push({
				action: 'moveTo',
				fid: fighter.id,
				tid: opponent.id
			});

			// Attack opponent
			launchAssault(fightData, fighter, opponent, true);

			// If not dead
			if (fighter.hp > 0) {
				// Add FLYING
				addStatus(fightData, fighter, Status.FLYING);

				// Add moveBack step
				fightData.steps.push({
					action: 'moveBack',
					fid: fighter.id
				});
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
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add moveTo step
			fightData.steps.push({
				action: 'moveTo',
				fid: fighter.id,
				tid: opponent.id
			});

			// Fighter attacks opponent
			launchAssault(fightData, fighter, opponent, false, Skill.M_BITE);

			// Check if fighter is not dead
			if (fighter.hp > 0) {
				// Add moveBack step
				fightData.steps.push({
					action: 'moveBack',
					fid: fighter.id
				});
			}
			break;
		}
		case Skill.M_STINGER: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add moveTo step
			fightData.steps.push({
				action: 'moveTo',
				fid: fighter.id,
				tid: opponent.id
			});

			// Fighter attacks opponent
			launchAssault(fightData, fighter, opponent, false, Skill.M_BITE, 7);

			// Check if opponent is not dead
			if (opponent.hp > 0) {
				// Add poison
				poison(fightData, opponent, fighter, Skill.M_STINGER);
			}

			// Check if fighter is not dead
			if (fighter.hp > 0) {
				// Add moveBack step
				fightData.steps.push({
					action: 'moveBack',
					fid: fighter.id
				});
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
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add moveTo step
			fightData.steps.push({
				action: 'moveTo',
				fid: fighter.id,
				tid: opponent.id
			});

			// Fighter attacks opponent
			launchAssault(fightData, fighter, opponent, true);

			// Check if fighter is not dead
			if (fighter.hp > 0) {
				const goldStolen = (randomBetween(0, 5) + 8) * 10;
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

				// Add moveBack step
				fightData.steps.push({
					action: 'moveBack',
					fid: fighter.id
				});
			}
			break;
		}
		case Skill.M_ELEMENTAL_DISCIPLE: {
			attackAllOpponents(fightData, fighter, skill, step);

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
			const sameRace = getAllies(fightData, fighter, ['monster']).filter(ally => ally.name === fighter.name);

			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			sameRace.forEach(ally => {
				// Add moveTo step
				fightData.steps.push({
					action: 'moveTo',
					fid: ally.id,
					tid: opponent.id
				});

				// Ally attacks opponent
				launchAssault(fightData, ally, opponent, true);

				// Check if fighter is not dead
				if (ally.hp > 0) {
					// Add moveBack step
					fightData.steps.push({
						action: 'moveBack',
						fid: ally.id
					});
				}
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
			attackAllOpponents(fightData, fighter, skill, step);

			// Change element
			fighter.element = fighter.elements[(fighter.elements.indexOf(fighter.element) + 1) % fighter.elements.length];
			break;
		}
		case Skill.M_DEMYOM_HEAL: {
			heal(fightData, fighter, 50);
			break;
		}
		case Skill.M_BOOM: {
			// Get non flying opponents
			const opponents = getOpponents(fightData, fighter).filter(opponent => !hasStatus(opponent, Status.FLYING));

			attackMultipleOpponents(fightData, fighter, opponents, skill, step);
			break;
		}
		case Skill.M_TORNADO: {
			getOpponents(fightData, fighter).forEach(opponent => {
				// Remove FLYING
				removeStatus(fightData, opponent, Status.FLYING);
			});

			attackAllOpponents(fightData, fighter, skill, step);
			break;
		}
		default:
			console.warn('Unknown skill', skill.id);
			return cancel();
	}

	// Consume energy
	setEnergy(fighter, fighter.energy - skill.energy, fightData);

	if (fighter.type !== 'boss') {
		// Get opponents with SHARIGNAN
		const opponentsWithSharingan = getOpponents(fightData, fighter).filter(opponent =>
			opponent.skills.some(skill => skill.id === Skill.SHARIGNAN)
		);

		opponentsWithSharingan.forEach(opponent => {
			// Abort if opponent already has the skill
			if (opponent.skills.some(s => s.id === skill.id)) return;

			// 20% chance to copy the skill
			const random = Math.random();

			if (random < 0.2) {
				// Add skillActivate step
				fightData.steps.push({
					action: 'skillActivate',
					fid: opponent.id,
					skill: Skill.SHARIGNAN,
					targets: []
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

	const random = Math.random();
	const countered = random < opponent.stats.special.counter - 1;

	// Counter stat
	if (countered) {
		updateStat(fightData, opponent, 'counters', 1);
	}

	return countered;
};

const loseHp = (fightData: DetailedFight, fighter: DetailedFighter, damage: number, fx: LifeEffect) => {
	// TODO: check for danger detector item
	let hp_lost = applyBalanceDamage(fighter, damage);
	fighter.hp -= hp_lost;

	fightData.steps.push({
		action: 'looseHp',
		fid: fighter.id,
		hp: hp_lost,
		fx
	});
};

const evade = (fightData: DetailedFight, opponent: DetailedFighter) => {
	// No evasion if opponent is dead
	if (opponent.hp <= 0) return false;

	const random = Math.random();
	const evaded = random < opponent.stats.special.evasion - 1;

	// Evasion stat
	if (evaded) {
		updateStat(fightData, opponent, 'evasions', 1);
	}

	return evaded;
};

const miss = (fighter: DetailedFighter) => {
	// No miss if not DAZZLED
	if (!hasStatus(fighter, Status.DAZZLED)) return false;

	const random = Math.random();

	// 30% chance to miss
	return random < 0.3;
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
export const heal = (fightData: DetailedFight, fighter: DetailedFighter, hp: number) => {
	// No heal if fighter is dead
	if (fighter.hp <= 0) return;

	// No heal if BEER
	if (hasStatus(fighter, Status.BEER)) return;

	const hpBeforeHeal = fighter.hp;

	fighter.hp += hp;

	if (fighter.hp > fighter.startingHp) {
		fighter.hp = fighter.startingHp;
	}

	const healAmount = fighter.hp - hpBeforeHeal;

	if (healAmount <= 0) return;

	// Add heal step
	fightData.steps.push({
		action: 'heal',
		fighter: stepFighter(fighter),
		hp: healAmount
	});

	// Heal stats
	updateStat(fightData, fighter, 'hpHealed', healAmount);

	// Group therapy
	const opponentsWhoCanCopyHeal = getOpponents(fightData, fighter).filter(opponent =>
		hasStatus(opponent, Status.COPY_HEAL)
	);

	opponentsWhoCanCopyHeal.forEach(opponent => {
		// Heal opponent
		heal(fightData, opponent, healAmount);

		removeStatus(fightData, opponent, Status.COPY_HEAL);
	});
};

export const applyStrategy = (fightData: DetailedFight, fighter: DetailedFighter) => {
	// Sort elements based on medium ennemies defense

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
	fighter.elements = defenses.map(defense => defense.element);
};

const attackTarget = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	opponent: DetailedFighter,
	is_close_combat: boolean,
	skill?: Skill,
	power?: number,
	skillStep?: SkillActivateStep
) => {
	// Abort if fighter is dead
	if (fighter.hp <= 0) return;

	// Store as previous target
	fighter.previousTarget = opponent.id;

	const attackers = [fighter];

	// Add teammates if Item.FRIENDLY_WHISTLE
	// TODO: rework, friendly whistle effect takes place at the beginning of the next turn
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

	let realOpponent = opponent;

	// Check if a dinoz is protecting the opponent
	const protector = getOpponents(fightData, fighter).find(opponent => opponent.protecting === opponent.id);

	if (protector) {
		realOpponent = protector;

		// Add moveTo step
		fightData.steps.push({
			action: 'moveTo',
			fid: protector.id,
			tid: opponent.id
		});
	}

	let hitsCount = 0;

	for (const attacker of attackers) {
		// Get damage
		const damageAndElements = getDamage(attacker, realOpponent, skill, undefined, power);
		let { damage } = damageAndElements;
		const { elements } = damageAndElements;

		// Add attempt step
		fightData.steps.push({
			action: 'attemptHit',
			fighter: stepFighter(attacker),
			target: stepFighter(realOpponent)
		});

		// Assault stat
		updateStat(fightData, attacker, 'attacks', 1);
		if (!skill) {
			updateStat(fightData, attacker, 'assaults', 1);
		}

		if (miss(attacker)) {
			damage = 0;

			// Add miss step
			fightData.steps.push({
				action: 'miss',
				fighter: stepFighter(attacker)
			});
		} else {
			// Check if opponent evaded
			if (evade(fightData, realOpponent)) {
				damage = 0;

				// Add evade step
				fightData.steps.push({
					action: 'evade',
					fighter: stepFighter(realOpponent)
				});
			}

			// FLYING
			if (
				is_close_combat &&
				// Opponent has FLYING
				hasStatus(realOpponent, Status.FLYING) &&
				// Attacker doesn't have FLYING
				!hasStatus(attacker, Status.FLYING) &&
				// Attacker can't hit flying opponent
				!attacker.canHitFlying
			) {
				damage = 0;

				// Add miss step
				fightData.steps.push({
					action: 'miss',
					fighter: stepFighter(attacker)
				});
			}
		}

		// Register hit if damage was done
		if (damage) {
			hitsCount++;

			registerHit(fightData, attacker, [realOpponent], damage, elements, skill, skillStep);

			// Apply all close combat after hit effects
			if (is_close_combat) {
				// Poison fighter if opponent has Skill.AURA_PUANTE and close combat
				if (realOpponent.skills.find(skill => skill.id === Skill.AURA_PUANTE)) {
					poison(fightData, attacker, realOpponent, Skill.AURA_PUANTE, StatusLength.MEDIUM);
				}

				// Poison opponent if fighter has Skill.GRIFFES_EMPOISONNEES and launched a water assault
				if (
					elements.find(element => element === ElementType.WATER) &&
					attacker.skills.find(skill => skill.id === Skill.GRIFFES_EMPOISONNEES)
				) {
					poison(fightData, realOpponent, attacker, Skill.GRIFFES_EMPOISONNEES, StatusLength.MEDIUM);
				}

				// Torch damage
				if (hasStatus(realOpponent, Status.TORCHED)) {
					loseHp(fightData, attacker, realOpponent.stats.special.torchDamage, LifeEffect.Fire);
				}

				// ACUPUNCTURE damage
				if (hasStatus(realOpponent, Status.HEALING)) {
					loseHp(fightData, attacker, 1, LifeEffect.Normal);
				}

				// GRIFFES_INFERNALES damage
				if (attacker.skills.find(skill => skill.id === Skill.GRIFFES_INFERNALES)) {
					const damage = attacker.stats.base[ElementType.FIRE];

					realOpponent.burnedBy = {
						id: attacker.id,
						skill: Skill.GRIFFES_INFERNALES,
						damage
					};
					addStatus(fightData, realOpponent, Status.BURNED, StatusLength.MEDIUM);
				}

				// M_FEBREZ
				if (realOpponent.type === 'dinoz' && attacker.skills.find(skill => skill.id === Skill.M_FEBREZ)) {
					// Regen 5% HP
					heal(fightData, realOpponent, Math.round(realOpponent.maxHp * 0.05 + 0.5));
				}

				// SANG_ACIDE damage
				if (
					// Opponent has SANG_ACIDE
					realOpponent.skills.find(skill => skill.id === Skill.SANG_ACIDE) &&
					// 1/3 chance
					randomBetween(0, 2) === 0
				) {
					loseHp(fightData, attacker, realOpponent.stats.special.acidBloodDamage, LifeEffect.Acid);
				}

				// FORME_VAPOREUSE
				if (
					// Opponent has FORME_VAPOREUSE
					realOpponent.skills.find(skill => skill.id === Skill.FORME_VAPOREUSE) &&
					// 5% chance
					randomBetween(0, 19) === 0
				) {
					// Add INTANGIBLE
					addStatus(fightData, realOpponent, Status.INTANGIBLE, StatusLength.SHORT);
				}

				// Poison opponent if fighter has Skill.HALEINE_FETIVE
				if (attacker.skills.find(skill => skill.id === Skill.HALEINE_FETIVE)) {
					poison(fightData, realOpponent, attacker, Skill.HALEINE_FETIVE, StatusLength.LONG);
				}

				// M_ELECTROCUTION damage
				if (realOpponent.skills.find(skill => skill.id === Skill.M_ELECTROCUTION)) {
					loseHp(fightData, attacker, randomBetween(1, 4), LifeEffect.Lightning);
				}
			}
		}

		// Cancel FLYING
		if (!hasStatus(attacker, Status.KEEP_FLYING)) {
			removeStatus(fightData, attacker, Status.FLYING);
		}
	}

	if (protector) {
		// Add moveBack step
		fightData.steps.push({
			action: 'moveBack',
			fid: protector.id
		});
	}

	return !!hitsCount;
};

export const checkDeaths = (fightData: DetailedFight) => {
	let attackersAlive = 0;
	let defendersAlive = 0;

	for (let i = 0; i < fightData.fighters.length; i++) {
		const fighter = fightData.fighters[i];

		// Skip escaped fighters
		if (fighter.escaped) continue;

		// Only add death step if fighter is dead and hasn't died yet
		if (
			fighter.hp <= 0 &&
			fightData.steps.filter(step => step.action === 'death' && step.fighter.id === fighter.id).length === 0
		) {
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
					registerHit(fightData, fighter, [opponent], opponent.hp);
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

			// Add death step
			fightData.steps.push({
				action: 'death',
				fighter: stepFighter(fighter)
			});

			// Phoenix Feather
			if (fighter.skills.some(skill => skill.id === Skill.PLUMES_DE_PHOENIX)) {
				// Add skillActivate step
				fightData.steps.push({
					action: 'skillActivate',
					fid: fighter.id,
					skill: Skill.PLUMES_DE_PHOENIX,
					targets: []
				});

				// Heal to 12 HP
				heal(fightData, fighter, 12 - fighter.hp);

				// Increase other fighters time by 10 * speed
				getFighters(fightData).forEach(f => {
					if (f.id !== fighter.id) {
						f.time += 10 * TIME_FACTOR * fighter.stats.speed.global;
					}
				});
			}

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
					heal(fightData, fighter, 50);
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
	// Check if fighter is not dead
	if (attacker.hp > 0) {
		// Add moveBack step
		fightData.steps.push({
			action: 'moveBack',
			fid: attacker.id
		});
	}

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
		} else {
			if (fightData.environment.type === Skill.FEU_DE_ST_ELME) {
				// Take 5% HP for LIGHTNING_STRUCK fighters
				getFighters(fightData).forEach(f => {
					if (hasStatus(f, Status.LIGHTNING_STRUCK)) {
						const damage = Math.round(f.hp * 0.05);

						// Register the hit
						registerHit(fightData, attacker, [f], damage, [ElementType.LIGHTNING], Skill.FEU_DE_ST_ELME);
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
		setEnergy(f, f.energy + (f.stats.special.energyRecovery ?? 1) * deltaTime * ENERGY_RECOVERY_BASE_FACTOR, fightData);
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

								// TODO: Temporary code to avoid endless fights
								// Forced poison to end the fight
								if (poisonedBy.id === -666) {
									const poisoner = {
										id: -666,
										name: 'God',
										type: 'boss' as const
									} as DetailedFighter;

									// Register the hp lost from poison
									loseHp(fightData, fighter, poisonedBy.damage, LifeEffect.Poison);
								} else {
									// Get poisoner
									const poisoner = fightData.fighters.find(f => f.id === poisonedBy.id);

									if (!poisoner) {
										sendJSONToDiscord('Error `Poisoner not found` in `playFighterTurn`.', { fightData: fightData });
										throw new Error('Poisoner not found');
									}

									// Register the hp lost from poison
									loseHp(fightData, fighter, poisonedBy.damage, LifeEffect.Poison);
								}
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
								loseHp(fightData, fighter, burnedBy.damage, LifeEffect.Burn);
								break;
							}
							case Status.HEALING: {
								// Heal 1 HP
								heal(fightData, fighter, 1);
								break;
							}
							case Status.TORCHED: {
								loseHp(fightData, fighter, 1, LifeEffect.Burn);
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

	if (fightData.loser) {
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
	const possibleSkill = attacker.nextSkill || randomlyGetSkill(attacker);
	if (possibleSkill) {
		// End turn if skill activated
		if (activateSkill(fightData, possibleSkill)) {
			endTurnChecks(fightData, attacker);
			return;
		}
	}

	// Sorceror's Wand replaces attacks
	if (attacker.items.some(item => item.itemId === Item.SORCERERS_STICK)) {
		attackSingleOpponent(fightData, attacker, itemList.SORCERERS_STICK, null);
		endTurnChecks(fightData, attacker);
		return;
	}

	// No assaults for NO_ASSAULT
	if (hasStatus(attacker, Status.NO_ASSAULT)) {
		endTurnChecks(fightData, attacker);
		return;
	}

	// At this point this is an assault

	// Get opponent
	const opponent = getRandomOpponent(fightData, attacker);

	// Add moveTo step
	fightData.steps.push({
		action: 'moveTo',
		fid: attacker.id,
		tid: opponent.id
	});

	// Fighter attacks opponent
	launchAssault(fightData, attacker, opponent, true);
	setEnergy(attacker, attacker.energy - 4, fightData);
	const countered = counterAttack(fightData, opponent);

	// If the opponent succeeds at countering, execute the counter
	if (countered) {
		// Add counter step
		fightData.steps.push({
			action: 'counter',
			fighter: stepFighter(opponent),
			opponent: stepFighter(attacker)
		});

		// Opponent attacks fighter
		launchAssault(fightData, opponent, attacker, true);
	}

	endTurnChecks(fightData, attacker);
};
