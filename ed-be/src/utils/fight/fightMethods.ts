/* eslint-disable no-param-reassign */

import { DinozSkillFiche } from "@drpg/core/models/dinoz/DinozSkillFiche";
import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { SkillType } from "@drpg/core/models/enums/SkillType";
import { BadFighterStatus, DetailedFighter, FighterStatus, FighterType, GoodFighterStatus } from "@drpg/core/models/fight/DetailedFighter";
import { LeaveAnimation, StepFighter } from "@drpg/core/models/fight/FightStep";
import { MonsterFiche } from "@drpg/core/models/fight/MonsterFiche";
import { monsterList } from "@drpg/core/models/fight/MonsterList";
import { ItemFiche } from "@drpg/core/models/item/ItemFiche";
import { Item, itemList } from "@drpg/core/models/item/ItemList";
import { AssaultElement } from "@drpg/core/utils/getAssaultStat";
import { DefenseElement } from "@drpg/core/utils/getDefenseStat";
import { ENERGY_RECOVERY_BASE_FACTOR, TIME_BASE, TIME_FACTOR } from "./fightConstants.js";
import { DetailedFight } from "./generateFight.js";
import getDamage from "./getDamage.js";
import { initializeDinoz, initializeMonster } from "./getFighters.js";
import randomBetween from "./randomBetween.js";
import weightedRandom from "./weightedRandom.js";

export const getFighters = (
	fightData: DetailedFight,
	dinozOnly?: boolean,
	monsterOnly?: boolean,
) => {
	let fighters = [];

	// Remove dead and escaped fighters
	fighters = fightData.fighters.filter((f) => f.hp > 0 && !f.escaped);

	if (dinozOnly) {
		fighters = fighters.filter((f) => f.type === 'dinoz');
	}

	if (monsterOnly) {
		fighters = fighters.filter((f) => f.type === 'monster');
	}

	return fighters;
}

export const getAllies = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	dinozOnly?: boolean,
	monsterOnly?: boolean,
) => {
	let allies = [];

	// Remove dead and escaped fighters and other team
	allies = fightData.fighters.filter((f) => f.hp > 0 && !f.escaped && f.attacker === fighter.attacker);

	if (dinozOnly) {
		allies = allies.filter((f) => f.type === 'dinoz');
	}

	if (monsterOnly) {
		allies = allies.filter((f) => f.type === 'monster');
	}

	return allies;
}

export const getOpponents = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	limitTypes?: FighterType[],
) => {
	let opponents = [];

	// Remove dead and escaped fighters and same team
	opponents = fightData.fighters.filter((f) => f.hp > 0 && !f.escaped && f.attacker !== fighter.attacker);

	if (limitTypes?.length) {
		opponents = opponents.filter((f) => limitTypes.includes(f.type));
	}

	return opponents;
};

const getRandomOpponent = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	limitTypes?: FighterType[],
) => {
	const opponents = getOpponents(fightData, fighter, limitTypes);

	// Target lowest HP opponent if Skill.SANS_PITIE
	if (fighter.skills.find((skill) => skill.id === Skill.SANS_PITIE)) {
		let lowestHp = Infinity;
		let lowestHpOpponent: DetailedFighter | null = null;

		opponents.forEach((opponent) => {
			if (opponent.hp < lowestHp) {
				lowestHp = opponent.hp;
				lowestHpOpponent = opponent;
			}
		});

		if (!lowestHpOpponent) {
			throw new Error('No lowest HP opponent found');
		}

		return lowestHpOpponent;
	}

	// Prioritize dinoz with Rock skill
	const withRock = opponents.filter((opponent) => opponent.skills.find((skill) => skill.id === Skill.ROCK));

	if (withRock.length) {
		const random = randomBetween(0, withRock.length - 1);

		return withRock[random];
	}

	const random = randomBetween(0, opponents.length - 1);

	return opponents[random];
};

const randomlyGetEvent = (fightData: DetailedFight, fighter: DetailedFighter) => {
	// No event if NO_EVENT
	if (fighter.status.includes(FighterStatus.NO_EVENT)) return null;

	// Check if a time manipulator is present
	if (fightData.timeManipulatorUsed && !fightData.temporalStabilityUsed) return null;

	// Check if a fighter has Item.TIME_MANIPULATOR
	if (!fightData.timeManipulatorUsed) {
		const timeManipulator = getFighters(fightData).find((f) => f.items.some((item) => item.itemId === Item.TIME_MANIPULATOR));

		if (timeManipulator) {
			fightData.timeManipulatorUsed = true;

			// Add item use step
			fightData.steps.push({
				action: 'itemUse',
				fighter: stepFighter(timeManipulator),
				itemId: Item.TIME_MANIPULATOR,
			});

			// Check if a fighter has Item.TEMPORAL_STABILISER
			const temporalStabiliser = getFighters(fightData).find((f) => f.items.some((item) => item.itemId === Item.TEMPORAL_STABILISER));

			if (temporalStabiliser) {
				fightData.temporalStabilityUsed = true;

				// Add item use step
				fightData.steps.push({
					action: 'itemUse',
					fighter: stepFighter(timeManipulator),
					itemId: Item.TEMPORAL_STABILISER,
				});

				// Add to items used
				temporalStabiliser.itemsUsed.push(Item.TEMPORAL_STABILISER);

				// Get item index
				const itemIndex = temporalStabiliser.items.findIndex((item) => item.itemId === Item.TEMPORAL_STABILISER);

				// Remove from items
				temporalStabiliser.items.splice(itemIndex, 1);
			} else {
				// Cancel all events
				return null;
			}
		}
	}

	const events: (DinozSkillFiche | ItemFiche)[] = fighter.skills.filter((skill) => skill.type === SkillType.E);

	events.push(...fighter.items.filter((item) => item.probability));

	if (!events.length) return null;

	// Order events by probability
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
	if (fighter.status.includes(FighterStatus.NO_SKILL)) return null;

	const skills = fighter.skills.filter((skill) => skill.type === SkillType.A);

	if (!skills.length) return null;

	// Go through each event and roll the dice
	for (let i = 0; i < skills.length; i++) {
		const skill = skills[i];

		// Skip if not enough energy
		if (fighter.energy < skill.energy) continue;

		if (randomBetween(1, 100) < (skill.probability ?? 0)) {
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
	fighter: Pick<DetailedFighter, 'id' | 'name' | 'type' | 'attacker' | 'activeSkills'>,
	opponents: DetailedFighter[],
	damage: number,
	damageElements: AssaultElement[] = [],
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

		// Danger detector (prevent hit if damage > 25)
		if (opponent.items.some((item) => item.itemId === Item.DANGER_DETECTOR) && actualDamage[opponent.id] > 25) {
			// Add item use step
			fightData.steps.push({
				action: 'itemUse',
				fighter: stepFighter(opponent),
				itemId: Item.DANGER_DETECTOR,
			});

			// Add to items used
			opponent.itemsUsed.push(Item.DANGER_DETECTOR);

			// Get item index
			const itemIndex = opponent.items.findIndex((item) => item.itemId === Item.DANGER_DETECTOR);

			// Remove from items
			opponent.items.splice(itemIndex, 1);

			// Restore HP
			opponent.hp += actualDamage[opponent.id];

			actualDamage[opponent.id] = 0;
		}

		// Add hit step
		fightData.steps.push({
			action: 'hit',
			fighter: stepFighter(fighter),
			target: stepFighter(opponent),
			damage: actualDamage[opponent.id],
			skill,
		});

		// Wake up
		if (fightData.environment?.type !== Skill.AMAZONIE || actualDamage[opponent.id] >= 10) {
			removeStatus(fightData, opponent, FighterStatus.ASLEEP);
		}

		// Intangible
		if (opponent.status.includes(FighterStatus.INTANGIBLE) && actualDamage[opponent.id]) {
			removeStatus(fightData, opponent, FighterStatus.INTANGIBLE);
		}

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

		// Dimensional powder item

		// Check if any fighter has Item.DIMENSIONAL_POWDER
		const dimensionalPowderUser = getFighters(fightData).find((f) => f.items.some((item) => item.itemId === Item.DIMENSIONAL_POWDER));

		if (dimensionalPowderUser) {
			// Add item use step
			fightData.steps.push({
				action: 'itemUse',
				fighter: stepFighter(dimensionalPowderUser),
				itemId: Item.DIMENSIONAL_POWDER,
			});

			// Escape opponent if HP requirement is met
			if (opponent.startingHp > 10 && opponent.hp > 0 && opponent.hp < 10) {
				// Add leave step
				fightData.steps.push({
					action: 'leave',
					fighter: stepFighter(opponent),
					animation: LeaveAnimation.BLACKHOLE,
				});

				opponent.escaped = true;
			}
		}

		// LIFE_STEALER
		if (actualDamage[opponent.id]
			&& opponent.hp < 20
			&& !opponent.status.includes(FighterStatus.STOLE_LIFE)
			&& opponent.items.some((item) => item.itemId === Item.LIFE_STEALER)) {
			// Steal 30 HP from a random opponent
			const randomOpponent = getRandomOpponent(fightData, opponent);

			// Add item use step
			fightData.steps.push({
				action: 'itemUse',
				fighter: stepFighter(opponent),
				itemId: Item.LIFE_STEALER,
			});

			registerHit(fightData, opponent, [randomOpponent], 30);

			heal(fightData, opponent, 30);

			// Add status
			addStatus(fightData, opponent, FighterStatus.STOLE_LIFE);
		}

		// Remove costume if fire damage
		if (opponent.costume && damage && damageElements.includes(AssaultElement.FIRE)) {
			// Take 3 damage
			registerHit(fightData, opponent, [opponent], 3);

			// Add leave step
			fightData.steps.push({
				action: 'leave',
				fighter: stepFighter(opponent),
			});

			// Add remove costume step
			fightData.steps.push({
				action: 'removeCostume',
				fighter: stepFighter(opponent),
			});

			opponent.costume = undefined;

			// Add arrive step
			fightData.steps.push({
				action: 'arrive',
				fighter: stepFighter(opponent),
			});
		}
	});

	if (!skill) {
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
	}
};

const evadedSkill = (opponent: DetailedFighter, skill: DinozSkillFiche) => {
	if (opponent.hp <= 0) return false;

	// Some statues prevent skill evasion
	const statusesPreventingEvasion = [
		FighterStatus.ASLEEP,
		FighterStatus.PETRIFIED,
		FighterStatus.FLYING,
		FighterStatus.STUNNED,
	];
	if (statusesPreventingEvasion.some((status) => opponent.status.includes(status))) {
		return false;
	}

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
	skillOrItem: DinozSkillFiche | ItemFiche
) => {
	// Get random opponent
	const opponent = getRandomOpponent(fightData, fighter);

	// Skill
	if ('id' in skillOrItem) {
		const skill = skillOrItem;

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
}

const targetAllOpponents = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	skill: DinozSkillFiche,
	count?: number,
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
		const { damage, elements } = getDamage(fighter, opponent, skill.id);

		// Register the hit
		registerHit(fightData, fighter, [opponent], damage, elements, skill.id);
	});
};

const createMonster = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	monsterData: MonsterFiche,
) => {
	// Count monsters of this type
	const count = fightData.fighters.filter((f) => f.type === 'monster' && f.name === monsterData.name).length;

	// Initialize monster
	const monster = initializeMonster(
		{ [monsterData.name]: count + 1 },
		fighter.attacker ? 0 : 1,
		monsterData,
	);

	// Adjust time
	monster.time = fighter.time;

	// Add monster to fighters
	fightData.fighters.push(monster);

	// Add arrive step
	fightData.steps.push({
		action: 'arrive',
		fighter: stepFighter(monster),
	});

	checkInvocationBan(fightData, monster);

	return monster;
};

const checkInvocationBan = (
	fightData: DetailedFight,
	invocation: DetailedFighter,
) => {
	// Get fighters
	const fighters = getFighters(fightData);

	// Check if a fighter has Item.BANISHMENT
	const banisher = fighters.find((f) => f.items.some((item) => item.itemId === Item.BANISHMENT));

	if (!banisher) return;

	// Add item use step
	fightData.steps.push({
		action: 'itemUse',
		fighter: stepFighter(banisher),
		itemId: Item.BANISHMENT,
	});

	// Add leave step
	fightData.steps.push({
		action: 'leave',
		fighter: stepFighter(invocation),
	});

	invocation.escaped = true;
};

const activateEnvironment = (
	fightData: DetailedFight,
	caster: DetailedFighter,
	environment: Skill,
) => {
	// Set environment
	fightData.environment = {
		type: environment,
		caster,
		turnsLeft: 3,
	}

	// Add activate environment step
	fightData.steps.push({
		action: 'activateEnvironment',
		environment,
	});
}

const activateEvent = (
	fightData: DetailedFight,
	event: DinozSkillFiche | ItemFiche,
): boolean => {
	// Get current fighter
	const fighter = fightData.fighters[0];

	// If event is a skill
	if ('id' in event) {
		// Add skillActivate step
		fightData.steps.push({
			action: 'skillActivate',
			dinoz: stepFighter(fighter),
			skill: event.id,
			energy: event.energy,
		});

		switch (event.id) {
			// AIR
			// FIRE
			case Skill.COMBUSTION:
			case Skill.BRASERO: {
				targetAllOpponents(fightData, fighter, event);
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
				addStatus(fightData, fighter, FighterStatus.SHIELDED);
				break;
			}
			case Skill.BENEDICTION: {
				addStatus(fightData, fighter, FighterStatus.BLESSED);
				break;
			}
			case Skill.FOCUS: {
				fighter.nextAssaultBonus += fighter.stats.base[AssaultElement.LIGHTNING];
				break;
			}
			case Skill.PUREE_SALVATRICE: {
				// Remove all the bad status of the group
				getAllies(fightData, fighter).forEach(fighter => {
					removeStatus(fightData, fighter, ...fighter.status.filter((s) => BadFighterStatus.includes(s)));
				})
				break;
			}
			// WATER
			case Skill.DOUCHE_ECOSSAISE: {
				targetSingleOpponent(fightData, fighter, event);
				break;
			}
			case Skill.CLONE_AQUEUX: {
				const initialDinoz = fightData.initialDinozList.find((d) => d.id === fighter.id && fighter.type === 'dinoz');

				if (!initialDinoz) {
					throw new Error('No initial dinoz found');
				}

				const clone = initializeDinoz(
					null,
					fighter.attacker ? 0 : 1,
					initialDinoz
				);

				clone.level = 1;
				clone.hp = 1;
				clone.type = 'clone';

				// Set the clone's time to the fighter's time
				clone.time = fighter.time;

				// Set HP to 10% if Item.TEAR_OF_LIFE
				if (fighter.items.some((item) => item.itemId === Item.TEAR_OF_LIFE)) {
					clone.hp = Math.round(clone.startingHp * 0.1);
				}

				// Add clone to fighters
				fightData.fighters.push(clone);

				// Add arrive step
				fightData.steps.push({
					action: 'arrive',
					fighter: stepFighter(clone),
				});

				checkInvocationBan(fightData, clone);
				break;
			}
			case Skill.DIETE_CHROMATIQUE: {
				// Pick a random opponent (no filtering is applied intentionally)
				const opponents = getOpponents(fightData, fighter);
				const opponent = opponents[randomBetween(0, opponents.length - 1)];

				// Lock that opponent to a random element
				opponent.element = opponent.elements[Math.round(Math.random() * opponent.elements.length)]
				addStatus(fightData, opponent, FighterStatus.LOCKED);
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

				if (!opponent.status.includes(FighterStatus.FLYING)) {
					// Increase the opponent's time
					opponent.time += 15 * TIME_FACTOR;
				}
				break;
			}
			case Skill.RESISTANCE_A_LA_MAGIE: {
				// Remove all bad status
				removeStatus(fightData, fighter, ...fighter.status.filter((s) => BadFighterStatus.includes(s)));
				break;
			}
			case Skill.ETAT_PRIMAL: {
				getFighters(fightData).forEach((f) => {
					// Remove team bad status
					if (f.attacker === fighter.attacker) {
						removeStatus(fightData, f, ...f.status.filter((s) => BadFighterStatus.includes(s)));
					} else {
						// Remove opponent team good status
						removeStatus(fightData, f, ...f.status.filter((s) => GoodFighterStatus.includes(s)));
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
				getAllies(fightData, fighter).forEach((f) => {
					// Skip self
					if (f.id === fighter.id && f.type === fighter.type) return;

					// Heal 1-wood HP
					heal(fightData, f, randomBetween(1, fighter.stats.base[AssaultElement.WOOD]));
				});
				break;
			}
			case Skill.ESPRIT_GORILLOZ: {
				const monster = createMonster(fightData, fighter, monsterList.GORILLOZ_SPIRIT);

				// Set intangible
				addStatus(fightData, monster, FighterStatus.INTANGIBLE);
				break;
			}
			default:
				// Remove last step
				fightData.steps.pop();

				return false;
		}

		// Consume energy
		fighter.energy -= event.energy;
	} else {
		// Event is an item

		// Set this to false if item is not one-use
		let itemUsed = true;

		// Add item use step
		fightData.steps.push({
			action: 'itemUse',
			fighter: stepFighter(fighter),
			itemId: event.itemId,
		});

		// Cancel method to use if the item ends up not being triggered
		const cancel = () => {
			// Remove last step
			fightData.steps.pop();

			return false;
		}

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
				fighter.stats.special.armor = (fighter.stats.special.armor ?? 0) + 1;
				break;
			}
			case Item.PAMPLEBOUM_PIT:
			case Item.LITTLE_PEPPER: {
				fighter.nextAssaultBonus += 10;
				break;
			}
			case Item.ZIPPO: {
				addStatus(fightData, fighter, FighterStatus.TORCHED);
				break;
			}
			case Item.SOS_FLAME: {
				createMonster(fightData, fighter, monsterList.FLAM);
				break;
			}
			case Item.REFRIGERATED_SHIELD: {
				fighter.stats.defense[DefenseElement.FIRE] += 10;
				break;
			}
			case Item.GOBLIN_MERGUEZ: {
				// Cancel if no HP lost
				if (fighter.hp === fighter.startingHp) {
					return cancel();
				}

				// -10% all defenses
				fighter.stats.defense[DefenseElement.FIRE] -= 10;
				fighter.stats.defense[DefenseElement.WATER] -= 10;
				fighter.stats.defense[DefenseElement.WOOD] -= 10;
				fighter.stats.defense[DefenseElement.LIGHTNING] -= 10;
				fighter.stats.defense[DefenseElement.AIR] -= 10;

				// Regen 1-4 HP (weighted)
				heal(fightData, fighter, weightedRandom([10, 7, 5, 3]));
				break;
			}
			case Item.PORTABLE_LOVE: {
				// Check if an opponent is flying
				const opponent = getOpponents(fightData, fighter)
					.find((f) => f.status.includes(FighterStatus.FLYING));

				if (!opponent) {
					return cancel();
				}

				fighter.canHitFlying = true;
				break;
			}
			case Item.MONOCHROMATIC: {
				// Check if an opponent has an Antichromatic
				const opponent = getOpponents(fightData, fighter)
					.find((f) => f.items.some((item) => item.itemId === Item.ANTICHROMATIC));

				// Don't cancel, just don't apply the effect and trigger the ANTICHROMATIC
				if (opponent) {
					// Add item use step
					fightData.steps.push({
						action: 'itemUse',
						fighter: stepFighter(opponent),
						itemId: Item.ANTICHROMATIC,
					});
					break;
				}

				// Get dinoz best element
				const bestElement = fighter.elements.reduce((acc, element) => {
					if (fighter.stats.base[element] > fighter.stats.base[acc]) {
						return element;
					}

					return acc;
				}, AssaultElement.FIRE);

				// Set element
				fighter.element = bestElement;

				// Lock element
				addStatus(fightData, fighter, FighterStatus.LOCKED);
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
				if (fighter.status.includes(FighterStatus.PETRIFIED) || fighter.status.includes(FighterStatus.STUNNED)) {
					return cancel();
				}

				// Get random opponent attacker
				const opponentAttacker = getRandomOpponent(fightData, fighter);

				// Get other opponents
				const opponentsWithoutAttacker = opponents.filter((opponent) => opponent.id !== opponentAttacker.id);

				// Get random opponent defender
				const opponentDefender = opponentsWithoutAttacker[randomBetween(0, opponentsWithoutAttacker.length - 1)];

				// Add moveTo step
				fightData.steps.push({
					action: 'moveTo',
					fighter: stepFighter(opponentAttacker),
					target: stepFighter(opponentDefender),
				});

				// Attack defender
				startAttack(fightData, opponentAttacker, opponentDefender);

				// Check if fighter is not dead
				if (opponentAttacker.hp > 0) {
					// Add moveBack step
					fightData.steps.push({
						action: 'moveBack',
						fighter: stepFighter(opponentAttacker),
					});
				}
				break;
			}
			case Item.STRONG_TEA: {
				// Get allies
				const allies = getAllies(fightData, fighter);

				// Check if the team has BEER status
				const hasBeer = allies.some((f) => f.status.includes(FighterStatus.BEER));

				if (!hasBeer) {
					return cancel();
				}

				// Remove BEER status
				allies.forEach((f) => {
					removeStatus(fightData, f, FighterStatus.BEER);
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

				// Make all fighters with WOOD < 10 fall asleep
				getFighters(fightData).forEach((f) => {
					if (f.stats.base[AssaultElement.WOOD] < 10) {
						addStatus(fightData, f, FighterStatus.ASLEEP);
					}
				});
				break;
			}
			case Item.LAND_OF_ASHES: {
				// Only one environment active at a time
				if (fightData.environment) {
					return cancel();
				}

				activateEnvironment(fightData, fighter, Skill.PAYS_DE_CENDRE);

				// Add NO_EVENT, NO_SKILL to all fighters with FIRE < 10
				getFighters(fightData).forEach((f) => {
					if (f.stats.base[AssaultElement.FIRE] < 10) {
						addStatus(fightData, f, FighterStatus.NO_EVENT);
						addStatus(fightData, f, FighterStatus.NO_SKILL);
					}
				});
				break;
			}
			case Item.ABYSS: {
				// Only one environment active at a time
				if (fightData.environment) {
					return cancel();
				}

				activateEnvironment(fightData, fighter, Skill.ABYSSE);

				// Add WEAKENED to all fighters with WATER < 10
				getFighters(fightData).forEach((f) => {
					if (f.stats.base[AssaultElement.WATER] < 10) {
						addStatus(fightData, f, FighterStatus.WEAKENED);
					}
				});
				break;
			}
			case Item.ST_ELMAS_FIRE: {
				// Only one environment active at a time
				if (fightData.environment) {
					return cancel();
				}

				activateEnvironment(fightData, fighter, Skill.FEU_DE_ST_ELME);

				// Add LIGHTNING_WEAKENED to all fighters with LIGHTNING < 10
				getFighters(fightData).forEach((f) => {
					if (f.stats.base[AssaultElement.LIGHTNING] < 10) {
						addStatus(fightData, f, FighterStatus.LIGHTNING_STRUCK);
					}
				});
				break;
			}
			case Item.UVAVU: {
				// Only one environment active at a time
				if (fightData.environment) {
					return cancel();
				}

				activateEnvironment(fightData, fighter, Skill.OURANOS);

				// Add AIR_SLOWED to all fighters with AIR < 10
				getFighters(fightData).forEach((f) => {
					if (f.stats.base[AssaultElement.AIR] < 10) {
						addStatus(fightData, f, FighterStatus.AIR_SLOWED);
					}
				});
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

		if (itemUsed) {
			// Add to items used
			fighter.itemsUsed.push(event.itemId);

			// Get item index
			const itemIndex = fighter.items.findIndex((item) => item.itemId === event.itemId);

			// Remove from items
			fighter.items.splice(itemIndex, 1);
		}
	}

	return true;
};

const addStatus = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	status: FighterStatus,
) => {
	// Check if fighter already has the status
	if (fighter.status.includes(status)) return;

	// Bad status
	const isBad = BadFighterStatus.includes(status);

	// Negate if SELF_CONTROL
	if (isBad && fighter.skills.find((skill) => skill.id === Skill.SELF_CONTROL)) return;

	// Handle the immediate effect of the status
	switch (status) {
		case FighterStatus.TORCHED: {
			fighter.stats.defense[AssaultElement.FIRE] += 10;
			break;
		}
		case FighterStatus.SLOWED: {
			fighter.stats.speed.global *= 1.5;
			break;
		}
		case FighterStatus.QUICKENED: {
			fighter.stats.speed.global /= 1.5;
			break;
		}
		case FighterStatus.PETRIFIED:
		case FighterStatus.SHIELDED: {
			if (!fighter.stats.special.armor) {
				fighter.stats.special.armor = 5;
			} else {
				fighter.stats.special.armor += 5;
			}
		}
		case FighterStatus.BLESSED: {
			fighter.stats.assault[AssaultElement.AIR] += 3;
			fighter.stats.assault[AssaultElement.FIRE] += 3;
			fighter.stats.assault[AssaultElement.LIGHTNING] += 3;
			fighter.stats.assault[AssaultElement.WATER] += 3;
			fighter.stats.assault[AssaultElement.WOOD] += 3;
			break;
		}
		default: {
			break;
		}
	};

	// Add status
	fighter.status.push(status);

	// Add status step
	fightData.steps.push({
		action: 'addStatus',
		fighter: stepFighter(fighter),
		status,
	});
};

const removeStatus = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	...statusList: FighterStatus[]
) => {
	statusList.forEach((status) => {
		// Check if fighter has the status
		if (!fighter.status.includes(status)) return;

		// Add status step
		fightData.steps.push({
			action: 'removeStatus',
			fighter: stepFighter(fighter),
			status,
		});

		// Reverse the effect of the status
		switch (status) {
			case FighterStatus.TORCHED: {
				fighter.stats.defense[AssaultElement.FIRE] -= 10;
				break;
			}
			case FighterStatus.SLOWED: {
				fighter.stats.speed.global /= 1.5;
				break;
			}
			case FighterStatus.QUICKENED: {
				fighter.stats.speed.global *= 1.5;
				break;
			}
			case FighterStatus.PETRIFIED:
			case FighterStatus.SHIELDED: {
				if (!fighter.stats.special.armor || fighter.stats.special.armor <= 5) {
					fighter.stats.special.armor = 0;
				} else {
					fighter.stats.special.armor -= 5;
				}
			}
			case FighterStatus.BLESSED: {
				fighter.stats.assault[AssaultElement.AIR] -= 3;
				fighter.stats.assault[AssaultElement.FIRE] -= 3;
				fighter.stats.assault[AssaultElement.LIGHTNING] -= 3;
				fighter.stats.assault[AssaultElement.WATER] -= 3;
				fighter.stats.assault[AssaultElement.WOOD] -= 3;
				break;
			}
			default: {
				break;
			}
		};
	});


	// Remove status
	fighter.status = fighter.status.filter((s) => !statusList.includes(s));
}

const activateSkill = (
	fightData: DetailedFight,
	skill: DinozSkillFiche,
): boolean => {
	// Get current fighter
	const fighter = fightData.fighters[0];

	// Add skillActivate step
	fightData.steps.push({
		action: 'skillActivate',
		dinoz: stepFighter(fighter),
		skill: skill.id,
		energy: skill.energy,
	});

	// Cancel method to use if the skil ends up not being triggered
	const cancel = () => {
		// Remove last step
		fightData.steps.pop();

		return false;
	}

	switch (skill.id) {
		// Simple multi-target skills
		// AIR
		// FIRE
		case Skill.SOUFFLE_ARDENT:
		case Skill.METEORES: {
			targetAllOpponents(fightData, fighter, skill);
			break;
		}

		// Simple single-target skills
		// AIR
		// FIRE
		case Skill.BOULE_DE_FEU:
		case Skill.COULEE_DE_LAVE:
		// LIGHTNING
		case Skill.FOUDRE:
		// WATER
		case Skill.CANON_A_EAU:
		// WOOD
		case Skill.LANCEUR_DE_GLAND: {
			targetSingleOpponent(fightData, fighter, skill);
			break;
		}

		// Other skills
		// AIR
		// FIRE
		case Skill.PAUME_CHALUMEAU: {
			targetSingleOpponent(fightData, fighter, skill);

			// Increase time
			fighter.time += 15 * TIME_FACTOR;
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
		case Skill.SIESTE: {
			// Heal 1-20 HP
			heal(fightData, fighter, randomBetween(1, 20));

			// Fall asleep
			addStatus(fightData, fighter, FighterStatus.ASLEEP);
			break;
		}
		case Skill.DETONATION: {
			// The fighter will not suicide with the skill, it just loses its roll
			if (fighter.hp > 5) {
				registerHit(fightData, fighter, [fighter], 5, [AssaultElement.FIRE], skill.id);
				// Increase the time of all other fighters to make it look like the caster "gained" time
				getFighters(fightData).forEach(f => {
					if (f.id !== fighter.id) {
						f.time += 15 * TIME_FACTOR;
					}
				})
			}
			break;
		}
		// LIGHTNING
		case Skill.AUBE_FEUILLUE: {
			// Heal each fighter of the caster's group
			const hpHealed = fighter.stats.base[AssaultElement.LIGHTNING] * 2 + fighter.stats.base[AssaultElement.WOOD] * 2;
			getAllies(fightData, fighter).forEach(ally => {
				heal(fightData, ally, hpHealed);
			})
			break;
		}
		case Skill.CREPUSCULE_FLAMBOYANT: {
			targetAllOpponents(fightData, fighter, skill);
			break;
		}
		case Skill.DANSE_FOUDROYANTE: {
			// Attack a random opponent 5 times

			// Get opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Add moveTo step
			fightData.steps.push({
				action: 'moveTo',
				fighter: stepFighter(fighter),
				target: stepFighter(opponent)
			});

			for (let i = 0; i < 5; i++) {
				// Fighter attacks opponent
				startAttack(fightData, fighter, opponent, true, Skill.DANSE_FOUDROYANTE);

				const countered = counterAttack(fighter, opponent);

				// If the opponent succeeds at countering, execute the counter
				if (countered) {
					// Add counter step
					fightData.steps.push({
						action: 'counter',
						fighter: stepFighter(opponent),
						opponent: stepFighter(fighter),
					});

					// Opponent attacks fighter
					startAttack(fightData, opponent, fighter, true);
				}
			}


			// Check if fighter is not dead
			if (fighter.hp > 0) {
				// Add moveBack step
				fightData.steps.push({
					action: 'moveBack',
					fighter: stepFighter(fighter),
				});
			}
			break;
		}
		case Skill.ECLAIR_SINUEUX: {
			targetAllOpponents(fightData, fighter, skill, 3);
			break;
		}
		// WATER
		case Skill.COUP_SOURNOIS: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			const damageAndElements = getDamage(fighter, opponent, skill.id);
			let { damage } = damageAndElements;
			const { elements } = damageAndElements;

			// Cancel if no damage
			if (!damage) {
				return cancel();
			}

			// 0 damage if boss or Skill.PERCEPTION
			if (opponent.skills.find((s) => s.id === Skill.PERCEPTION) || opponent.type === 'boss') {
				damage = 0;
			} else {
				// 50% HP otherwise
				damage = Math.round(opponent.hp / 2);

				registerHit(fightData, fighter, [opponent], damage, elements, skill.id);
			}
			break;
		}
		case Skill.GEL: {
			const opponent = targetSingleOpponent(fightData, fighter, skill);

			if (opponent) {
				// Slow opponent
				addStatus(fightData, opponent, FighterStatus.SLOWED);
			}
			break;
		}
		case Skill.COUP_FATAL: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			const damageAndElements = getDamage(fighter, opponent, skill.id);
			let { damage } = damageAndElements;
			const { elements } = damageAndElements;

			// Cancel if no damage
			if (!damage) {
				return cancel();
			}

			// 0 damage if boss or Skill.PERCEPTION
			if (opponent.skills.find((s) => s.id === Skill.PERCEPTION) || opponent.type === 'boss') {
				damage = 0;
			} else {
				// 100% HP otherwise
				damage = opponent.hp;

				registerHit(fightData, fighter, [opponent], damage, elements, skill.id);
			}
			break;
		}
		case Skill.MARECAGE: {
			const opponents = getOpponents(fightData, fighter);

			// Slow opponents
			opponents.forEach((opponent) => {
				addStatus(fightData, opponent, FighterStatus.SLOWED);
			});
			break;
		}
		case Skill.MOIGNONS_LIQUIDES: {
			const opponent = getRandomOpponent(fightData, fighter);
			opponent.time += 15 * TIME_FACTOR;
			break;
		}
		case Skill.PETRIFICATION: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			// Petrify opponent
			removeStatus(fightData, opponent, FighterStatus.FLYING, FighterStatus.INTANGIBLE);
			addStatus(fightData, opponent, FighterStatus.PETRIFIED);

			// Instantly cancel if boss
			if (opponent.type === 'boss') {
				removeStatus(fightData, opponent, FighterStatus.PETRIFIED);
			}
			break;
		}
		case Skill.RAYON_KAAR_SHER: {
			targetAllOpponents(fightData, fighter, skill);

			// Remove mud wall of all opponents
			const opponents = getOpponents(fightData, fighter);
			opponents.forEach((opponent) => {
				// TODO
			});
			break;
		}
		case Skill.DELUGE: {
			targetAllOpponents(fightData, fighter, skill);
			// Increase time of all opponents by 5
			const opponents = getOpponents(fightData, fighter);
			opponents.forEach((opponent) => {
				opponent.time += 5 * TIME_FACTOR;
			});
		}
		// WOOD
		// AIR
		case Skill.TROU_NOIR: {
			// Prevent if item.ANTI_GRAVE_SUIT
			const opponentWithSuit = getOpponents(fightData, fighter).find((opponent) => opponent.items.some((item) => item.itemId === Item.ANTI_GRAVE_SUIT));

			if (opponentWithSuit) {
				// Add item use step
				fightData.steps.push({
					action: 'itemUse',
					fighter: stepFighter(opponentWithSuit),
					itemId: Item.ANTI_GRAVE_SUIT,
				});

				return true;
			}

			const opponent = getRandomOpponent(fightData, fighter);

			// Instantly cancel if boss
			if (opponent.type === 'boss') {
				return cancel();
			}

			// Add leave step
			fightData.steps.push({
				action: 'leave',
				fighter: stepFighter(opponent),
				animation: LeaveAnimation.BLACKHOLE,
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
			const opponentWithMask = getOpponents(fightData, fighter).find((opponent) => opponent.items.some((item) => item.itemId === Item.CUZCUSSIAN_MASK))

			if (opponentWithMask) {
				// Add item use step
				fightData.steps.push({
					action: 'itemUse',
					fighter: stepFighter(opponentWithMask),
					itemId: Item.CUZCUSSIAN_MASK,
				});

				// Add hypnotize step
				fightData.steps.push({
					action: 'endHypnosis',
					fighter: stepFighter(opponent),
				});
			} else {
				// Hypnotized for 3 turns
				opponent.hypnotized = 4;

				// Change team
				opponent.attacker = !opponent.attacker;

				// Add hypnotize step
				fightData.steps.push({
					action: 'hypnotize',
					fighter: stepFighter(opponent),
				});
			}
		}
		default:
			// Remove last step
			fightData.steps.pop();

			return false;
	}

	// Consume energy
	fighter.energy -= skill.energy;

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

const poison = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	poisoner: DetailedFighter,
	skill: Skill
) => {
	// No poison if fighter is dead
	if (fighter.hp <= 0) return;

	// No poison if fighter is already poisoned
	if (fighter.status.includes(FighterStatus.POISONED)) return;

	// No poison if fighter is cured
	if (fighter.status.includes(FighterStatus.CURED)) return;

	// Check if fighter has Item.ANTIDOTE
	if (fighter.items.some((item) => item.itemId === Item.ANTIDOTE)) {
		// Add item use step
		fightData.steps.push({
			action: 'itemUse',
			fighter: stepFighter(fighter),
			itemId: Item.ANTIDOTE,
		});

		// Set CURED
		addStatus(fightData, fighter, FighterStatus.CURED);
		return;
	}

	// Check if fighter has Item.POISONITE_SHOT
	if (fighter.items.some((item) => item.itemId === Item.POISONITE_SHOT)) {
		// Remove item
		const itemIndex = fighter.items.findIndex((item) => item.itemId === Item.POISONITE_SHOT);
		fighter.items.splice(itemIndex, 1);

		// Add to items used
		fighter.itemsUsed.push(Item.POISONITE_SHOT);

		// Add item use step
		fightData.steps.push({
			action: 'itemUse',
			fighter: stepFighter(fighter),
			itemId: Item.POISONITE_SHOT,
		});

		// Set CURED
		addStatus(fightData, fighter, FighterStatus.CURED);
		return;
	}

	fighter.poisonedBy = {
		id: poisoner.id,
		type: poisoner.type,
		skill,
	};

	addStatus(fightData, fighter, FighterStatus.POISONED);
};

// Helper method to heal a fighter
const heal = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	hp: number,
) => {
	// No heal if fighter is dead
	if (fighter.hp <= 0) return;

	// No heal if BEER
	if (fighter.status.includes(FighterStatus.BEER)) return;

	const heal = Math.min(hp, fighter.maxHp - fighter.hp);
	fighter.hp += heal;

	// Add heal step
	fightData.steps.push({
		action: 'heal',
		fighter: stepFighter(fighter),
		hp: heal,
	});
}

const attack = (
	fightData: DetailedFight,
	fighter: DetailedFighter,
	opponent: DetailedFighter,
	skill?: Skill,
) => {
	// Abort if fighter is dead
	if (fighter.hp <= 0) return;

	const attackers = [fighter];

	// Add teammates if Item.FRIENDLY_WHISTLE
	if (fighter.items.some((item) => item.itemId === Item.FRIENDLY_WHISTLE)) {
		const allies = getAllies(fightData, fighter)
			.filter((ally) => (ally.id !== fighter.id && ally.type === fighter.type) && !ally.items.some((item) => item.itemId === Item.FRIENDLY_WHISTLE));
		attackers.push(...allies);
	}

	for (const attacker of attackers) {
		// Get damage
		const damageAndElements = getDamage(attacker, opponent, skill);
		let { damage } = damageAndElements;
		const { elements } = damageAndElements;

		const evaded = evade(opponent);

		// Add attempt step
		fightData.steps.push({
			action: 'attemptHit',
			fighter: stepFighter(attacker),
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
			registerHit(fightData, attacker, [opponent], damage, elements, skill);

			// Poison fighter if opponent has Skill.AURA_PUANTE
			if (opponent.skills.find((skill) => skill.id === Skill.AURA_PUANTE)) {
				poison(fightData, attacker, opponent, Skill.AURA_PUANTE);
			}

			// Poison opponent if fighter has Skill.GRIFFES_EMPOISONNEES
			if (attacker.skills.find((skill) => skill.id === Skill.GRIFFES_EMPOISONNEES)) {
				poison(fightData, opponent, attacker, Skill.GRIFFES_EMPOISONNEES);
			}

			// Torch damage
			if (attacker.status.includes(FighterStatus.TORCHED)) {
				const damage = attacker.stats.special.torchDamage ?? 0;

				registerHit(fightData, attacker, [opponent], damage, [AssaultElement.FIRE], Skill.TORCHE);
			}

			// ACUPUNCTURE damage
			if (opponent.skills.find((skill) => skill.id === Skill.ACUPUNCTURE)) {
				registerHit(fightData, opponent, [attacker], 1, [], Skill.ACUPUNCTURE);
			}
		}
	}

	// Change fighter element
	if (!skill && !fighter.status.includes(FighterStatus.LOCKED)) {
		fighter.element = fighter.elements[fighter.elements.indexOf(fighter.element) + 1 % fighter.elements.length];
	}
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
			// Check if dinoz has SCALE
			if (fighter.items.some((item) => item.itemId === Item.SCALE)) {
				// Get random opponent
				const opponent = getRandomOpponent(fightData, fighter);

				if (opponent) {
					// Add item use step
					fightData.steps.push({
						action: 'itemUse',
						fighter: stepFighter(fighter),
						itemId: Item.SCALE,
					});

					// Kill opponent
					registerHit(fightData, fighter, [opponent], opponent.hp);
				};
			}

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
	skill?: Skill,
) => {
	// Keep track of initial fighter HP
	const initialFighterHp = fighter.hp;

	// Trigger fighter attack
	attack(fightData, fighter, opponent, skill);

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
			attack(fightData, fighter, opponent, skill);

			random = Math.random();
		}
	}

	// Check if a fighter is dead
	checkDeaths(fightData);
};

const endTurnChecks = (
	fightData: DetailedFight,
	attacker: DetailedFighter,
) => {
	// Check if fighter is not dead
	if (attacker.hp > 0) {
		// Add moveBack step
		fightData.steps.push({
			action: 'moveBack',
			fighter: stepFighter(attacker),
		});
	}

	// Check if fighter is poisoned
	const poisonedBy = attacker.poisonedBy;
	if (!fightData.loser && attacker.hp > 0 && poisonedBy) {
		// TODO: Temporary code to avoid endless fights
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
			registerHit(fightData, poisoner, [attacker], 100, [], Skill.SANG_ACIDE);
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
				case Skill.GRIFFES_EMPOISONNEES: {
					poisonDamage = 14;
					break;
				}
				default:
					console.warn(`Poison skill ${poisonedBy.skill} not implemented`);
					break;
			}

			// Register the hit
			registerHit(fightData, poisoner, [attacker], poisonDamage, [], poisonedBy.skill);
		}
	}

	// Calculate new attacker's time
	let time = TIME_BASE * TIME_FACTOR
		* attacker.stats.speed.global
		* attacker.stats.speed[attacker.element];

	// Increase time lost if AIR_SLOWED
	if (attacker.status.includes(FighterStatus.AIR_SLOWED)) {
		time *= 1.5;
	}

	// Round up time
	time = Math.round(time);

	// Minimum time
	if (time <= 0) {
		time = 1;
	}

	// Add the new time to the attacker
	attacker.time += Math.round(time);
};

export const playFighterTurn = (
	fightData: DetailedFight,
) => {
	const attacker = fightData.fighters[0];

	// Environment
	if (fightData.environment
		&& attacker.id === fightData.environment.caster.id
		&& attacker.type === fightData.environment.caster.type) {
		// Decrease turns left
		fightData.environment.turnsLeft--;

		// Remove environment if no more turns left
		if (fightData.environment.turnsLeft <= 0) {
			switch (fightData.environment.type) {
				case Skill.AMAZONIE: {
					// Wake up all fighters
					getFighters(fightData).forEach((f) => {
						removeStatus(fightData, f, FighterStatus.ASLEEP);
					});
					break;
				}
				case Skill.PAYS_DE_CENDRE: {
					// Remove NO_EVENT, NO_SKILL from all fighters
					getFighters(fightData).forEach((f) => {
						removeStatus(fightData, f, FighterStatus.NO_EVENT, FighterStatus.NO_SKILL);
					});
					break;
				}
				case Skill.ABYSSE: {
					// Remove WEAKENED from all fighters
					getFighters(fightData).forEach((f) => {
						removeStatus(fightData, f, FighterStatus.WEAKENED);
					});
					break;
				}
				case Skill.FEU_DE_ST_ELME: {
					// Remove LIGHTNING_STRUCK from all fighters
					getFighters(fightData).forEach((f) => {
						removeStatus(fightData, f, FighterStatus.LIGHTNING_STRUCK);
					});
					break;
				}
				case Skill.OURANOS: {
					// Remove AIR_SLOWED from all fighters
					getFighters(fightData).forEach((f) => {
						removeStatus(fightData, f, FighterStatus.AIR_SLOWED);
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
				environment: fightData.environment.type,
			});

			fightData.environment = undefined;
		} else {
			if (fightData.environment.type === Skill.FEU_DE_ST_ELME) {
				// Take 5% HP for LIGHTNING_STRUCK fighters
				getFighters(fightData).forEach((f) => {
					if (f.status.includes(FighterStatus.LIGHTNING_STRUCK)) {
						const damage = Math.round(f.hp * 0.05);

						// Register the hit
						registerHit(fightData, attacker, [f], damage, [AssaultElement.LIGHTNING], Skill.FEU_DE_ST_ELME);
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
				fighter: stepFighter(attacker),
			});
		}
	}

	// Calculate the elapsed time
	const elapsed_time = attacker.time - fightData.time;

	// Set current time to first fighter time
	fightData.time = fightData.fighters[0].time;

	// Recover energy for all fighters except the current one
	getFighters(fightData).forEach((f) => {
		if (f.id === attacker.id) return;
		f.energy += (f.stats.special.energyRecovery ?? 1) * elapsed_time * ENERGY_RECOVERY_BASE_FACTOR;
	});

	// TODO
	// Check status of all fighters only if at least one unit of time has elapsed
	// Torch damage
	if (attacker.status.includes(FighterStatus.TORCHED)) {
		registerHit(fightData, attacker, [attacker], 1, [AssaultElement.FIRE], Skill.TORCHE);
	}

	// ACUPUNCTURE heal
	if (attacker.skills.find((skill) => skill.id === Skill.ACUPUNCTURE)) {
		// Heal 1 HP
		heal(fightData, attacker, 1);
	}

	checkDeaths(fightData);

	// Event activation
	const possibleEvent = randomlyGetEvent(fightData, attacker);
	if (possibleEvent) {
		activateEvent(fightData, possibleEvent);
	}

	// Skill activation
	const possibleSkill = randomlyGetSkill(attacker);
	if (possibleSkill) {
		// End turn if skill activated
		if (activateSkill(fightData, possibleSkill)) {
			endTurnChecks(fightData, attacker);
			return;
		}
	}

	// Sorceror's Wand replaces attacks
	if (attacker.items.some((item) => item.itemId === Item.SORCERERS_STICK)) {
		targetSingleOpponent(fightData, attacker, itemList.SORCERERS_STICK);
		endTurnChecks(fightData, attacker);
		return;
	}

	// At this point this is an assault

	// Get opponent
	const opponent = getRandomOpponent(fightData, attacker);


	// Add moveTo step
	fightData.steps.push({
		action: 'moveTo',
		fighter: stepFighter(attacker),
		target: stepFighter(opponent)
	});

	// Fighter attacks opponent
	startAttack(fightData, attacker, opponent);

	// Consume energy
	attacker.energy -= 4;

	const countered = counterAttack(attacker, opponent);

	// If the opponent succeeds at countering, execute the counter
	if (countered) {
		// Add counter step
		fightData.steps.push({
			action: 'counter',
			fighter: stepFighter(opponent),
			opponent: stepFighter(attacker),
		});

		// Opponent attacks fighter
		startAttack(fightData, opponent, attacker, true);
	}

	endTurnChecks(fightData, attacker);
};
