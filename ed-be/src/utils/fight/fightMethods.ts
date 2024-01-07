/* eslint-disable no-param-reassign */

import { DinozSkillFiche } from "@drpg/core/models/dinoz/DinozSkillFiche";
import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { BadFighterStatus, DetailedFighter, FighterStatus } from "@drpg/core/models/fight/DetailedFighter";
import { StepFighter } from "@drpg/core/models/fight/FightStep";
import { DetailedFight } from "./generateFight.js";
import getDamage from "./getDamage.js";
import randomBetween from "./randomBetween.js";
import { SkillType } from "@drpg/core/models/enums/SkillType";
import { MonsterFiche } from "@drpg/core/models/fight/MonsterFiche";
import { initializeDinoz, initializeMonster } from "./getFighters.js";
import { monsterList } from "@drpg/core/models/fight/MonsterList";
import { AssaultElement } from "@drpg/core/utils/getAssaultStat";
import { ENERGY_RECOVERY_BASE_FACTOR, TIME_BASE, TIME_FACTOR } from "./fightConstants.js";
import { ItemFiche } from "@drpg/core/models/item/ItemFiche";

export const getFighters = (
	fightData: DetailedFight,
	dinozOnly?: boolean,
	monsterOnly?: boolean,
) => {
	let fighters = [];

	// Remove dead fighters
	fighters = fightData.fighters.filter((f) => f.hp > 0);

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

	// Remove Dead fighters and other team
	allies = fightData.fighters.filter((f) => f.hp > 0 && f.attacker === fighter.attacker);

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

const randomlyGetEvent = (fightData: DetailedFight, dinoz: DetailedFighter) => {
	const events: (DinozSkillFiche | ItemFiche)[] = dinoz.skills.filter((skill) => skill.type === SkillType.E);

	events.push(...dinoz.items.filter((item) => item.probability));

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
			if (dinoz.energy < event.energy) continue;
		}

		if (randomBetween(1, 100) < (event.probability ?? 0)) {
			return event;
		}
	}

	return null;
};

const randomlyGetSkill = (fightData: DetailedFight, dinoz: DetailedFighter) => {
	const skills = dinoz.skills.filter((skill) => skill.type === SkillType.A);

	if (!skills.length) return null;

	// Go through each event and roll the dice
	for (let i = 0; i < skills.length; i++) {
		const skill = skills[i];

		// Skip if not enough energy
		if (dinoz.energy < skill.energy) continue;

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

		// Wake up
		removeStatus(fightData, opponent, FighterStatus.ASLEEP);

		// Intangible
		if (opponent.status.includes(FighterStatus.INTANGIBLE) && actualDamage[opponent.id]) {
			removeStatus(fightData, opponent, FighterStatus.INTANGIBLE);
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

	return opponent;
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

	return monster;
};

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
			// FIRE
			case Skill.COLERE: {
				fighter.nextAssaultMultiplier *= 1.25;

				// Add to active skills
				fighter.activeSkills.push(event.id);
				break;
			}
			case Skill.COMBUSTION: {
				targetAllOpponents(fightData, fighter, event);
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
				removeStatus(fightData, fighter, ...fighter.status.filter((s) => !BadFighterStatus.includes(s)));
				break;
			}
			case Skill.ETAT_PRIMAL: {
				getFighters(fightData).forEach((f) => {
					// Remove team bad status
					if (f.attacker === fighter.attacker) {
						removeStatus(fightData, f, ...f.status.filter((s) => !BadFighterStatus.includes(s)));
					} else {
						// Remove opponent team good status
						removeStatus(fightData, f, ...f.status.filter((s) => BadFighterStatus.includes(s)));
					}
				});
				break;
			}
			case Skill.PRINTEMPS_PRECOCE: {
				// Heal all allies
				getAllies(fightData, fighter).forEach((f) => {
					// Skip self
					if (f.id === fighter.id && f.type === fighter.type) return;

					// Heal 1-wood HP
					let hpHealed = randomBetween(1, fighter.stats.base[AssaultElement.WOOD]);

					// Don't overheal
					if (f.hp + hpHealed > f.maxHp) {
						hpHealed = f.maxHp - f.hp;
					}

					f.hp += hpHealed;

					// Add heal step
					fightData.steps.push({
						action: 'heal',
						fighter: stepFighter(f),
						hp: hpHealed,
					});
				});
				break;
			}
			case Skill.ESPRIT_GORILLOZ: {
				const monster = createMonster(fightData, fighter, monsterList.GORILLOZ_SPIRIT);

				// Set intangible
				addStatus(fightData, monster, FighterStatus.INTANGIBLE);
				break;
			}
			// WATER
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

				// Add clone to fighters
				fightData.fighters.push(clone);
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

	switch (skill.id) {
		// FIRE
		case Skill.SOUFFLE_ARDENT:
		case Skill.METEORES: {
			targetAllOpponents(fightData, fighter, skill);
			break;
		}
		case Skill.BOULE_DE_FEU:
		case Skill.COULEE_DE_LAVE: {
			targetSingleOpponent(fightData, fighter, skill);
			break;
		}
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
			const hpHealed = randomBetween(1, 20);
			fighter.hp += hpHealed;

			// Add heal step
			fightData.steps.push({
				action: 'heal',
				fighter: stepFighter(fighter),
				hp: hpHealed,
			});

			// Fall asleep
			addStatus(fightData, fighter, FighterStatus.ASLEEP);
			break;
		}
		// WATER
		case Skill.CANON_A_EAU: {
			targetSingleOpponent(fightData, fighter, skill);
			break;
		}
		case Skill.COUP_SOURNOIS: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			let damage = getDamage(fighter, opponent, skill.id);

			// Cancel if no damage
			if (!damage) {
				// Remove last step
				fightData.steps.pop();

				return false;
			}

			// 0 damage if boss or Skill.PERCEPTION
			if (opponent.skills.find((s) => s.id === Skill.PERCEPTION) || opponent.type === 'boss') {
				damage = 0;
			} else {
				// 50% HP otherwise
				damage = Math.round(opponent.hp / 2);

				registerHit(fightData, fighter, [opponent], damage, skill.id);
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
		case Skill.DOUCHE_ECOSSAISE: {
			targetAllOpponents(fightData, fighter, skill);
			break;
		}
		case Skill.COUP_FATAL: {
			// Get random opponent
			const opponent = getRandomOpponent(fightData, fighter);

			let damage = getDamage(fighter, opponent, skill.id);

			// Cancel if no damage
			if (!damage) {
				// Remove last step
				fightData.steps.pop();

				return false;
			}

			// 0 damage if boss or Skill.PERCEPTION
			if (opponent.skills.find((s) => s.id === Skill.PERCEPTION) || opponent.type === 'boss') {
				damage = 0;
			} else {
				// 100% HP otherwise
				damage = opponent.hp;

				registerHit(fightData, fighter, [opponent], damage, skill.id);
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

		if (!fighter.status.includes(FighterStatus.POISONED)) {
			// Poison fighter if opponent has Skill.AURA_PUANTE
			if (opponent.skills.find((skill) => skill.id === Skill.AURA_PUANTE)) {
				fighter.poisonedBy = {
					id: opponent.id,
					type: opponent.type,
					skill: Skill.AURA_PUANTE,
				};

				addStatus(fightData, fighter, FighterStatus.POISONED);
			}
		}

		if (!opponent.status.includes(FighterStatus.POISONED)) {
			// Poison opponent if fighter has Skill.GRIFFES_EMPOISONNEES
			if (fighter.skills.find((skill) => skill.id === Skill.GRIFFES_EMPOISONNEES)) {
				opponent.poisonedBy = {
					id: opponent.id,
					type: opponent.type,
					skill: Skill.GRIFFES_EMPOISONNEES,
				};

				addStatus(fightData, opponent, FighterStatus.POISONED);
			}
		}

		// Torch damage
		if (fighter.status.includes(FighterStatus.TORCHED)) {
			const damage = fighter.stats.special.torchDamage ?? 0;

			registerHit(fightData, fighter, [opponent], damage, Skill.TORCHE);
		}

		// ACUPUNCTURE damage
		if (opponent.skills.find((skill) => skill.id === Skill.ACUPUNCTURE)) {
			registerHit(fightData, opponent, [fighter], 1, Skill.ACUPUNCTURE);
		}
	}

	// Change fighter element
	if (!fighter.status.includes(FighterStatus.LOCKED)) {
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
	const attacker = fightData.fighters[0];

	// Calculate the elapsed time
	const elapsed_time = attacker.time - fightData.time;

	// Set current time to first fighter time
	fightData.time = fightData.fighters[0].time;

	// Recover energy for all fighters except the current one
	fightData.fighters.forEach((f) => {
		if (f.id === attacker.id) return;
		f.energy += (f.stats.special.energyRecovery ?? 1) * elapsed_time * ENERGY_RECOVERY_BASE_FACTOR;
	});

	// TODO
	// Check status of all fighters only if at least one unit of time has elapsed
	// Torch damage
	if (attacker.status.includes(FighterStatus.TORCHED)) {
		registerHit(fightData, attacker, [attacker], 1, Skill.TORCHE);
	}

	// ACUPUNCTURE heal
	if (attacker.skills.find((skill) => skill.id === Skill.ACUPUNCTURE)) {
		attacker.hp += 1;

		// Add heal step
		fightData.steps.push({
			action: 'heal',
			fighter: stepFighter(attacker),
			hp: 1,
		});
	}

	// TODO check any deads from the status

	// Event activation
	const possibleEvent = randomlyGetEvent(fightData, attacker);
	if (possibleEvent) {
		activateEvent(fightData, possibleEvent);
	}

	// Skill activation
	const possibleSkill = randomlyGetSkill(fightData, attacker);
	if (possibleSkill) {
		// End turn if skill activated
		if (activateSkill(fightData, possibleSkill)) {
			return;
		}
	}

	// Get opponent
	const opponent = getRandomOpponent(fightData, attacker);

	const countered = counterAttack(attacker, opponent);

	// Add moveTo step
	fightData.steps.push({
		action: 'moveTo',
		fighter: stepFighter(attacker),
		target: stepFighter(opponent),
		countered,
	});

	// Check if opponent is not trapped and countered
	if (countered) {
		// Add counter step
		fightData.steps.push({
			action: 'counter',
			fighter: stepFighter(opponent),
			opponent: stepFighter(attacker),
		});

		// Opponent attacks fighter
		startAttack(fightData, opponent, attacker, true);
	} else {
		// Fighter attacks opponent
		startAttack(fightData, attacker, opponent);
	}

	// Consume energy
	attacker.energy -= 4;

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
			registerHit(fightData, poisoner, [attacker], 100, Skill.SANG_ACIDE);
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
			registerHit(fightData, poisoner, [attacker], poisonDamage, poisonedBy.skill);
		}
	}

	// Increase attacker's time
	let time = TIME_BASE * TIME_FACTOR
		* attacker.stats.speed.global
		* attacker.stats.speed[attacker.element];

	// TODO need to handle this differently because the status will expire
	// Increase time lost if slowed
	if (attacker.status.includes(FighterStatus.SLOWED)) {
		time *= 1.5;
	}

	// Decrease time if quickened
	if (attacker.status.includes(FighterStatus.QUICKENED)) {
		time /= 1.5;
	}

	// Minimum time
	if (time < 0) {
		time = 1;
	}

	attacker.time += Math.round(time);
};
