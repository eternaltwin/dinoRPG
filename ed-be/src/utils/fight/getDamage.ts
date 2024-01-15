import { Skill, skillList } from "@drpg/core/models/dinoz/SkillList";
import { ElementType } from "@drpg/core/models/enums/ElementType";
import { DetailedFighter, Status } from "@drpg/core/models/fight/DetailedFighter";
import { Item } from "@drpg/core/models/item/ItemList";
import { ATTACK_GLOBAL_FACTOR } from "./fightConstants.js";
import { SkillAttacks } from "./skillAttacks.js";
import { hasStatus } from "./fightMethods.js";

const BASE_ATTACK_VALUE = 2;
const BASE_DEFENSE_VALUE = 0;
export const DEFAULT_ATTACK_POWER = 5;

export const getBasicElementDamage = (
	fighter: DetailedFighter,
	element: ElementType,
	power?: number
) => {
	return fighter.stats.base[element] * (power || DEFAULT_ATTACK_POWER) + fighter.stats.assaultBonus[element];
};

export const getDamage = (
	attacker: DetailedFighter,
	opponent: DetailedFighter,
	skill?: Skill,
	item?: Item,
	power?: number,
) => {
	let attack = BASE_ATTACK_VALUE;
	let defense = BASE_DEFENSE_VALUE;
	let attackElements: ElementType[] = [];

	// Calculate the attacker's attack score
	// From a skill
	if (skill && !power) {
		// Cancel if intangible
		if (hasStatus(opponent, Status.INTANGIBLE)) {
			return {
				damage: 0,
				elements: [],
			};
		}

		// Get the skill base damage relative to the skill power
		switch (skill) {
			// Combustion inflicts a fixed amount, so the value is directly returned
			case Skill.COMBUSTION: {
				return {
					damage: opponent.stats.base[ElementType.WOOD],
					elements: [ElementType.WOOD],
				};
			}
			// 50% of the opponent's HP
			case Skill.M_CURSED_WAND: {
				return {
					damage: Math.round(opponent.hp * 0.5),
					elements: [ElementType.VOID],
				};
			}
			// Handle by default skills as an offensive skill with a list of element powers
			default: {
				const skillAttack = SkillAttacks[skill];

				if (!skillAttack) {
					throw new Error(`Skill attack ${skill} not found`);
				}

				attackElements = Object.keys(skillAttack).map((element) => +element as ElementType);
				attack += attackElements.reduce((acc, element) => {
					const elementPower = skillAttack[element] || 0;
					const elementValue = attacker.stats.base[element];
					return acc + elementPower * elementValue;
				}, 0);

				break;
			}
		}

		// Add elemental bonuses corresponding to the skill elements
		for (const element of attackElements) {
			attack += attacker.skillElementalBonus[element];
		}
	// From an item
	} else if (item) {
		switch (item) {
			case Item.SORCERERS_STICK: {
				// 30% of the opponent's HP
				attack = opponent.hp * 0.3;
			}
			default: {
				console.warn(`Item ${item} not handled`);
				break;
			}
		}
	// From an assault (the assault can be triggered by a skill)
	} else {
		if (power && skill) {
			attackElements = [...skillList[skill].element];
		} else {
			attackElements = [attacker.element];
		}

		// Intangible
		if (hasStatus(opponent, Status.INTANGIBLE)) {
			// Can hit intangible or is air element
			if (attacker.canHitIntangible || attackElements.includes(ElementType.AIR)) {
				return {
					damage: 1,
					elements: attackElements,
				};
			} else {
				return {
					damage: 0,
					elements: attackElements,
				};
			}
		}

		const assaultElement = attackElements[0] || attacker.element;
		let assaultValue = getBasicElementDamage(attacker, assaultElement, power);

		// VOID = all elements
		if (assaultElement === ElementType.VOID) {
			assaultValue = getBasicElementDamage(attacker, ElementType.AIR, power)
				+ getBasicElementDamage(attacker, ElementType.FIRE, power)
				+ getBasicElementDamage(attacker, ElementType.WATER, power)
				+ getBasicElementDamage(attacker, ElementType.WOOD, power)
				+ getBasicElementDamage(attacker, ElementType.LIGHTNING, power);
		}

		// Damage from a normal hit
		attack += assaultValue * (power || 1);

		// Add next assault bonus
		attack += attacker.nextAssaultBonus;
		attacker.nextAssaultBonus = 0;

		// Multiply by next assault multiplier
		attack *= attacker.nextAssaultMultiplier;
		attacker.nextAssaultMultiplier = 1;

		// -25% damage if WEAKENED
		if (hasStatus(attacker, Status.WEAKENED)) {
			attack *= 0.75;
		}
	}

	// Add random attack bonus: up to 33%
	const random_attack_bonus = Math.random() * attack / 3;
	attack += random_attack_bonus;

	// Apply global attack factor
	attack *= ATTACK_GLOBAL_FACTOR;

	// Calculate the opponent's defense score
	// TODO for multi-element skills, there's a different calculation to use
	const assaultElement = attackElements[0] || attacker.element;
	defense += opponent.stats.defense[assaultElement];

	// Add armor to the defense unless the attacker cancels it
	if (!attacker.cancelArmor) {
		defense += opponent.stats.special.armor;
	}

	let damage = attack - defense;

	damage = Math.round(damage);

	// Set minimum damage
	if (damage < attacker.minDamage) {
		damage = attacker.minDamage;
	}
	// Set minimum damage for assaults only
	if (!skill && damage < attacker.minAssaultDamage) {
		damage = attacker.minAssaultDamage;
	}

	// Absorb water damage if M_WORM
	if (opponent.skills.some((skill) => skill.id === Skill.M_WORM)) {
		if (attackElements.includes(ElementType.WATER)) {
			opponent.absorbed = damage;
			damage = 0;
		}
	}

	return {
		damage,
		elements: attackElements,
	};
};
