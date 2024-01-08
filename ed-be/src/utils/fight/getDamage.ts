import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { DetailedFighter, FighterStatus } from "@drpg/core/models/fight/DetailedFighter";
import { AssaultElement } from "@drpg/core/utils/getAssaultStat";
import { ATTACK_GLOBAL_FACTOR } from "./fightConstants.js";
import { SkillAttacks } from "./skillAttacks.js";
import { Item } from "@drpg/core/models/item/ItemList";

const BASE_ATTACK_VALUE = 2;
const BASE_DEFENSE_VALUE = 0;

const getDamage = (
	attacker: DetailedFighter,
	opponent: DetailedFighter,
	skill?: Skill,
	item?: Item,
) => {
	let attack = BASE_ATTACK_VALUE;
	let defense = BASE_DEFENSE_VALUE;

	// Calculate the attacker's attack score
	if (skill) {
		let attackElements = [AssaultElement.FIRE];

		// Cancel if intangible
		if (opponent.status.includes(FighterStatus.INTANGIBLE)) {
			return 0;
		}

		// Get the skill base damage relative to the skill power
		switch (skill) {
			// Combustion inflicts a fixed amount, so the value is directly returned
			case Skill.COMBUSTION: {
				// fixedDamage = true;
				return opponent.stats.base[AssaultElement.WOOD];
			}
			case Skill.CREPUSCULE_FLAMBOYANT: {
				attackElements = [AssaultElement.FIRE, AssaultElement.LIGHTNING];
				attack = 6 * attacker.stats.base[AssaultElement.FIRE] + 6 * attacker.stats.base[AssaultElement.LIGHTNING];
			}
			// Handle by default skills as an offensive skill with a given power and element
			default: {
				const skillAttack = SkillAttacks[skill];

				if (!skillAttack) {
					throw new Error(`Skill attack ${skill} not found`);
				}

				attackElements = [skillAttack.element];
				attack = skillAttack.power * attacker.stats.base[skillAttack.element];
				break;
			}
		}

		// Add elemental bonuses corresponding to the skill elements
		for (const element of attackElements) {
			attack += attacker.skillElementalBonus[element];
		}

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
	} else {
		// Intangible
		if (opponent.status.includes(FighterStatus.INTANGIBLE)) {
			// Can hit intangible or is air element
			if (attacker.canHitIntangible || attacker.element === AssaultElement.AIR) {
				return 1;
			} else {
				return 0;
			}
		}

		// Damage from a normal hit
		attack += attacker.stats.assault[attacker.element];

		// Add next assault bonus
		attack += attacker.nextAssaultBonus;
		attacker.nextAssaultBonus = 0;

		// Multiply by next assault multiplier
		attack *= attacker.nextAssaultMultiplier;
		attacker.nextAssaultMultiplier = 1;

		// -25% damage if WEAKENED
		if (attacker.status.includes(FighterStatus.WEAKENED)) {
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
	defense += opponent.stats.defense[attacker.element];

	// Add armor to the defense unless the attacker cancels it
	if (!attacker.cancelArmor) {
		defense += opponent.stats.special.armor ?? 0;
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
	return damage;
};

export default getDamage;
