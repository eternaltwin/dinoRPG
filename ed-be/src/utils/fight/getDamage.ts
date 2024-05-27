import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { DetailedFighter, Status } from '@drpg/core/models/fight/DetailedFighter';
import { Item } from '@drpg/core/models/item/ItemList';
import { ATTACK_GLOBAL_FACTOR } from './fightConstants.js';
import { FixedSkillDamage, SkillAttacks } from './skillAttacks.js';
import { hasStatus } from './fightMethods.js';

const BASE_ATTACK_VALUE = 2;
const BASE_DEFENSE_VALUE = 0;
export const DEFAULT_ATTACK_POWER = 5;

export const getBasicElementDamage = (fighter: DetailedFighter, element: ElementType, power?: number) => {
	return fighter.stats.base[element] * (power || DEFAULT_ATTACK_POWER) + fighter.stats.assaultBonus[element];
};

// Balance the damage if the fighter (supposedly the target of the damage) requires balanced damage
export const applyBalanceDamage = (fighter: DetailedFighter, damage: number) => {
	return fighter.balanced ? balanceDamage(damage) : damage;
};

// Applies x^0.6 to damage to smooth it and obtain balanced results
export const balanceDamage = (damage: number) => {
	return Math.round(Math.pow(Math.max(damage, 0), 0.6));
};

// Calculates the elemental attack given the fighter and the power of the attack
export const getElementalAttack = (
	fighter: DetailedFighter,
	element_type: ElementType,
	power: number
) => {
	return fighter.stats.base[element_type] * power;
}

// Returns the attack and defense score for a given attack considering the various bonuses
// of the attacker and the target
// Note: calling this method resets the attacker's next assault bonuses (multiplier and additive)
export const getAttackDefense = (
	attacker: DetailedFighter,
	target: DetailedFighter,
	element_attack: [ElementType, number][],
	isCloseCombat: boolean,
) => {
	let attack = BASE_ATTACK_VALUE;
	let defense = BASE_DEFENSE_VALUE;
	let sum_of_elements = 0;
	let elements: ElementType[] = [];

	// Go over all the elements of the attack
	// Add the attacker's elemental attack and possible bonus to the attack score
	// Add the target's elemental defense
	element_attack.forEach(val => {
		const ele = val[0];
		const att = val[1];
		elements.push(ele);
		attack += att;
		sum_of_elements += att;
		if (att > 0) {
			defense += target.stats.defense[ele];
			if (isCloseCombat) {
				attack += attacker.stats.assaultBonus[ele];
			}
			else {
				attack += attacker.skillElementalBonus[ele];
			}
		}
	});

	// Add close combat specific bonuses
	if (isCloseCombat) {
		attack += attacker.nextAssaultBonus;
		attack *= attacker.nextAssaultMultiplier;
		attacker.nextAssaultBonus = 0;
		attacker.nextAssaultMultiplier = 1;
	}

	// -25% to attack score if attacker is WEAKENED
	if (hasStatus(attacker, Status.WEAKENED)) {
		attack *= 0.75;
	}

	// Average the defense in case of multi-element attack
	if (sum_of_elements > 0) {
		defense /= sum_of_elements;
	}

	// Add armor to the defense unless the attacker cancels it
	if (!attacker.cancelArmor) {
		defense += target.stats.special.armor;
	}

	return {
		attack,
		defense,
		elements
	};
}

// Applies final factors to the attack score:
// - random bonus of up to 33%
// - global factor
export const calculateDamage = (
	attacker: DetailedFighter,
	attack: number,
	defense: number,
	isCloseCombat: boolean,
) => {
	// Apply random factor
	const random_attack_bonus = (Math.random() * attack) / 3;
	attack += random_attack_bonus;

	// Apply global factor
	attack *= ATTACK_GLOBAL_FACTOR;

	let damage = attack - defense;

	// Check for global minimum damage
	if (damage < attacker.minDamage) {
		damage = attacker.minDamage
	}

	// Check for assault specific minimum damage
	if (isCloseCombat && damage < attacker.minAssaultDamage) {
		damage = attacker.minAssaultDamage;
	}

	return damage;
}

export const getDamage = (
	attacker: DetailedFighter,
	opponent: DetailedFighter,
	skill?: Skill,
	item?: Item,
	power?: number
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
				elements: []
			};
		}

		// Get the skill base damage relative to the skill power
		switch (skill) {
			// Combustion inflicts a fixed amount, so the value is directly returned
			case Skill.COMBUSTION: {
				return {
					damage: applyBalanceDamage(opponent, opponent.stats.base[ElementType.WOOD]),
					elements: [ElementType.WOOD]
				};
			}
			// 50% of the opponent's HP
			case Skill.M_CURSED_WAND: {
				return {
					damage: Math.round(opponent.hp * 0.5),
					elements: [ElementType.VOID]
				};
			}
			// ECRASEMENT
			case Skill.ECRASEMENT: {
				// Get strongest element
				const strongestElement = [
					attacker.stats.base[ElementType.FIRE],
					attacker.stats.base[ElementType.WATER],
					attacker.stats.base[ElementType.WOOD],
					attacker.stats.base[ElementType.LIGHTNING],
					attacker.stats.base[ElementType.AIR]
				].sort((a, b) => b - a)[0];

				const power = strongestElement * 5;

				attack += Math.max(power, 40);

				break;
			}
			// M_DEMYOM_ATTACK
			case Skill.M_DEMYOM_ATTACK: {
				const power = attacker.stats.base[attacker.element] * 8;

				attack += Math.max(power, 40);

				break;
			}
			// M_GRIZOU
			case Skill.M_GRIZOU: {
				const power = attacker.stats.base[ElementType.VOID];

				attack += power;

				break;
			}
			// Handle by default skills as an offensive skill with a list of element powers
			default: {
				const skillAttack = SkillAttacks[skill];

				if (!skillAttack) {
					throw new Error(`Skill attack ${skill} not found`);
				}

				attackElements = Object.keys(skillAttack).map(element => +element as ElementType);

				// Don't use elements for fixed attacks
				if (FixedSkillDamage.includes(skill)) {
					attack += attackElements.reduce((acc, element) => {
						const elementPower = skillAttack[element] || 0;
						return acc + elementPower;
					}, 0);
				} else {
					attack += attackElements.reduce((acc, element) => {
						const elementPower = skillAttack[element] || 0;
						const elementValue = attacker.stats.base[element];
						return acc + elementPower * elementValue;
					}, 0);
				}

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
					elements: attackElements
				};
			} else {
				return {
					damage: 0,
					elements: attackElements
				};
			}
		}

		const assaultElement = attackElements[0] || attacker.element;
		let assaultValue = getBasicElementDamage(attacker, assaultElement, power);

		// No extra damage if VOID
		if (assaultElement === ElementType.VOID) {
			assaultValue = 1;
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
	const random_attack_bonus = (Math.random() * attack) / 3;
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

	// Smooth damage to prevent crazy numbers if both fighters require it
	if (attacker.balanced && opponent.balanced) {
		damage = balanceDamage(damage);
	}

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
	if (opponent.skills.some(skill => skill.id === Skill.M_WORM)) {
		if (attackElements.includes(ElementType.WATER)) {
			opponent.absorbed = damage;
			damage = 0;
		}
	}

	return {
		damage,
		elements: attackElements
	};
};
