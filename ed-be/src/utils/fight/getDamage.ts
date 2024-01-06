import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { DetailedFighter } from "@drpg/core/models/fight/DetailedFighter";
import { AssaultElement } from "@drpg/core/utils/getAssaultStat";

const BASE_ATTACK_VALUE = 2;
const BASE_DEFENSE_VALUE = 0;

const getDamage = (
	fighter: DetailedFighter,
	opponent: DetailedFighter,
	skill?: Skill,
) => {
	let damage = 0;
	let fixedDamage = false;

	// Damage from a skill hit
	if (skill) {
		switch (skill) {
			// FIRE
			case Skill.SOUFFLE_ARDENT: {
				return 5 * fighter.stats.base[AssaultElement.FIRE];
			}
			case Skill.PAUME_CHALUMEAU: {
				return 10 * fighter.stats.base[AssaultElement.FIRE];
			}
			case Skill.KAMIKAZE: {
				return 15 * fighter.stats.base[AssaultElement.FIRE];
			}
			case Skill.COMBUSTION: {
				fixedDamage = true;
				return opponent.stats.base[AssaultElement.WOOD];
			}
			case Skill.BOULE_DE_FEU: {
				return 7 * fighter.stats.base[AssaultElement.FIRE];
			}
			case Skill.COULEE_DE_LAVE: {
				return 12 * fighter.stats.base[AssaultElement.FIRE];
			}
			case Skill.METEORES: {
				return 10 * fighter.stats.base[AssaultElement.FIRE];
			}
			default: {
				return 0;
			}
		}
	} else {
		// Damage from a normal hit
		const base = fighter.stats.assault[fighter.element];

		damage = BASE_ATTACK_VALUE
			+ base
			+ fighter.nextHitBonus
			- BASE_DEFENSE_VALUE
			- opponent.stats.defense[fighter.element];
	}

	if (!fixedDamage) {
		// Armor
		if (!fighter.cancelArmor) {
			damage -= opponent.stats.special.armor ?? 0;
		}

		damage *= fighter.nextHitMultiplier;
	}

	damage = Math.round(damage);

	// Set minimum damage
	if (damage < fighter.minDamage) {
		damage = fighter.minDamage;
	}

	return damage;
};

export default getDamage;
