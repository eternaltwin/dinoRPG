import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { DetailedFighter, Status } from '@drpg/core/models/fight/DetailedFighter';
import { Item } from '@drpg/core/models/item/ItemList';
import { ASSAULT_POWER, ATTACK_GLOBAL_FACTOR } from '@drpg/core/utils/fightConstants';
import { hasStatus } from './fightMethods.js';
import seedrandom from 'seedrandom';

const BASE_ATTACK_VALUE = 2;
const BASE_DEFENSE_VALUE = 0;

// Gets the assault value for a given element
// Does not take into account multipliers and next-assault-type bonuses
export const getAssaultValue = (fighter: DetailedFighter, element: ElementType, power?: number) => {
	return fighter.stats.base[element] * (power || ASSAULT_POWER) + fighter.stats.assaultBonus[element];
};

// Balance the damage if the fighter (supposedly the target of the damage) requires balanced damage
export const applyBalanceDamage = (fighter: DetailedFighter, damage: number) => {
	return fighter.balanced ? balanceDamage(damage) : damage;
};

// Applies x^0.6 to damage to smooth it and obtain balanced results
export const balanceDamage = (damage: number) => {
	return Math.round(Math.pow(Math.max(damage, 0), 0.6));
};

// Calculates the attack power for a given element, the fighter and the power of the attack
export const getElementalAttack = (fighter: DetailedFighter, element_type: ElementType, power: number) => {
	return [[element_type, fighter.stats.base[element_type] * power]] as [ElementType, number][];
};

// Calculates the attack power for multiple elements, the fighter and the power of the attack
export const getMultiElementalAttack = (fighter: DetailedFighter, element_type_power: [ElementType, number][]) => {
	// let air_attack = 0;
	// let fire_attack = 0;
	// let lightning_attack = 0;
	// let water_attack = 0;
	// let wood_attack = 0;
	// let void_attack = 0;

	// element_type_power.forEach(val => {
	// 	let ele = val[0];
	// 	let power = val[1];

	// if (ele === ElementType.AIR) {
	// 	air_attack = power * fighter.stats.base[ElementType.AIR];
	// }
	// else if (ele === ElementType.FIRE) {
	// 	fire_attack = power * fighter.stats.base[ElementType.FIRE];
	// }
	// else if (ele === ElementType.LIGHTNING) {
	// 	lightning_attack = power * fighter.stats.base[ElementType.LIGHTNING];
	// }
	// else if (ele === ElementType.WATER) {
	// 	water_attack = power * fighter.stats.base[ElementType.WATER];
	// }
	// else if (ele === ElementType.WOOD) {
	// 	wood_attack = power * fighter.stats.base[ElementType.WOOD];
	// }
	// else if (ele === ElementType.VOID) {
	// 	void_attack = power * fighter.stats.base[ElementType.VOID];
	// }
	// });

	return element_type_power.map(val => {
		let ele = val[0];
		let power = val[1];
		return [ele, fighter.stats.base[ele] * power];
	}) as [ElementType, number][];

	// return {
	// 	[ElementType.AIR]: air_attack,
	// 	[ElementType.FIRE]: fire_attack,
	// 	[ElementType.LIGHTNING]: lightning_attack,
	// 	[ElementType.WATER]: water_attack,
	// 	[ElementType.WOOD]: wood_attack,
	// 	[ElementType.VOID]: void_attack,
	// };
};

// Returns the attack and defense score for a given attack considering the various bonuses
// of the attacker and the target
// Note: calling this method resets the attacker's next assault bonuses (multiplier and additive)
export const getAttackDefense = (
	attacker: DetailedFighter,
	target: DetailedFighter,
	element_attack: [ElementType, number][],
	isCloseCombat: boolean
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
			defense += target.stats.defense[ele] * att;
			if (isCloseCombat) {
				attack += attacker.stats.assaultBonus[ele];
			} else {
				attack += attacker.skillElementalBonus[ele];
			}
		}
	});

	// Add close combat specific bonuses
	if (isCloseCombat) {
		attack += attacker.nextAssaultBonus;
		attack *= attacker.nextAssaultMultiplier * attacker.allAssaultMultiplier;
		attacker.nextAssaultBonus = 0;
		attacker.nextAssaultMultiplier = 1;
	}

	// TODO this needs to be reworked, see Abysse
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
};

// Applies final factors to the attack score:
// - random bonus of up to 33%
// - global factor
// - balance if both fighters need balanced damage
export const calculateDamage = (
	random: seedrandom.PRNG,
	attacker: DetailedFighter,
	target: DetailedFighter,
	attack: number,
	defense: number,
	isCloseCombat: boolean
) => {
	// Apply random factor
	const random_attack_bonus = (random() * attack) / 3;
	attack += random_attack_bonus;

	// Apply global factor
	attack *= ATTACK_GLOBAL_FACTOR;

	let damage = attack - defense;

	// Apply balance effect if both fighters needs to be balanced
	if (attacker.balanced && target.balanced) {
		damage = balanceDamage(damage);
	}

	damage = Math.round(damage);

	// Check for global minimum damage
	if (damage < attacker.minDamage) {
		damage = attacker.minDamage;
	}

	// Check for assault specific minimum damage
	if (isCloseCombat && damage < attacker.minAssaultDamage) {
		damage = attacker.minAssaultDamage;
	}

	return damage;
};

// TODO remove when all has been handled in the new methods
// export const getDamage = (
// 	attacker: DetailedFighter,
// 	opponent: DetailedFighter,
// 	skill?: Skill,
// 	item?: Item,
// 	power?: number
// ) => {
// 	let attack = BASE_ATTACK_VALUE;
// 	let defense = BASE_DEFENSE_VALUE;
// 	let attackElements: ElementType[] = [];

// 	// Calculate the attacker's attack score
// 	// From a skill
// 	if (skill && !power) {
// 		// Get the skill base damage relative to the skill power
// 		switch (skill) {
// 			// 50% of the opponent's HP
// 			case Skill.M_CURSED_WAND: {
// 				return {
// 					damage: Math.round(opponent.hp * 0.5),
// 					elements: [ElementType.VOID]
// 				};
// 			}
// 			// M_DEMYOM_ATTACK
// 			case Skill.M_DEMYOM_ATTACK: {
// 				const power = attacker.stats.base[attacker.element] * 8;

// 				attack += Math.max(power, 40);

// 				break;
// 			}
// 			// M_GRIZOU
// 			case Skill.M_GRIZOU: {
// 				const power = attacker.stats.base[ElementType.VOID];

// 				attack += power;

// 				break;
// 			}
// 		// From an item
// 	} else if (item) {
// 		switch (item) {
// 			case Item.SORCERERS_STICK: {
// 				// 30% of the opponent's HP
// 				attack = opponent.hp * 0.3;
// 			}
// 			default: {
// 				console.warn(`Item ${item} not handled`);
// 				break;
// 			}
// 		}
// 		// From an assault (the assault can be triggered by a skill)
// 	} else {
// 		if (power && skill) {
// 			attackElements = [...skillList[skill].element];
// 		} else {
// 			attackElements = [attacker.element];
// 		}
// 	}

// 	return {
// 		damage,
// 		elements: attackElements
// 	};
// };
