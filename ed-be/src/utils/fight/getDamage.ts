import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { DetailedFighter, FighterStatus } from "@drpg/core/models/fight/DetailedFighter";
import { AssaultElement } from "@drpg/core/utils/getAssaultStat";
import { ATTACK_GLOBAL_FACTOR } from "./fightConstants.js";

const BASE_ATTACK_VALUE = 2;
const BASE_DEFENSE_VALUE = 0;

const getDamage = (
    attacker: DetailedFighter,
    opponent: DetailedFighter,
    skill?: Skill,
) => {
    let attack = BASE_ATTACK_VALUE;
    let defense = BASE_DEFENSE_VALUE;
    let attack_element = AssaultElement.FIRE;
    // let fixedDamage = false;

    // Calculate the attacker's attack score
    if (skill) {
        // Cancel if intangible
        if (opponent.status.includes(FighterStatus.INTANGIBLE)) {
            return 0;
        }
        // TODO this needs a bit more work to handle multi-element skills
        // May be put this in a method
        // Get the skill base damage relative to the skill power
        switch (skill) {
            // FIRE
            case Skill.SOUFFLE_ARDENT: {
                attack = 5 * attacker.stats.base[AssaultElement.FIRE];
                attack_element = AssaultElement.FIRE;
            }
            case Skill.PAUME_CHALUMEAU: {
                attack = 10 * attacker.stats.base[AssaultElement.FIRE];
                attack_element = AssaultElement.FIRE;
            }
            case Skill.KAMIKAZE: {
                attack = 15 * attacker.stats.base[AssaultElement.FIRE];
                attack_element = AssaultElement.FIRE;
            }
            // Combustion inflicts a fixed amount, so the value is directly returned
            case Skill.COMBUSTION: {
                // fixedDamage = true;
                return opponent.stats.base[AssaultElement.WOOD];
            }
            case Skill.BOULE_DE_FEU: {
                attack = 7 * attacker.stats.base[AssaultElement.FIRE];
                attack_element = AssaultElement.FIRE;
            }
            case Skill.COULEE_DE_LAVE: {
                attack = 12 * attacker.stats.base[AssaultElement.FIRE];
                attack_element = AssaultElement.FIRE;
            }
            case Skill.METEORES: {
                attack = 10 * attacker.stats.base[AssaultElement.FIRE];
                attack_element = AssaultElement.FIRE;
            }
            case Skill.BRASERO: {
                attack = 3 * attacker.stats.base[AssaultElement.FIRE];
                attack_element = AssaultElement.FIRE;
            }
            // WATER
            case Skill.CANON_A_EAU: {
                attack = 6 * attacker.stats.base[AssaultElement.WATER];
                attack_element = AssaultElement.WATER;
            }
            case Skill.GEL: {
                attack = 5 * attacker.stats.base[AssaultElement.WATER];
                attack_element = AssaultElement.WATER;
            }
            case Skill.DOUCHE_ECOSSAISE: {
                attack = 2 * attacker.stats.base[AssaultElement.WATER];
                attack_element = AssaultElement.WATER;
            }
            default: {
                attack = 0;
            }
        }

        // Add elemental bonus corresponding to the skill elements
        attack += attacker.skillElementalBonus[attack_element];

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

        attack_element = attacker.element;

        // Damage from a normal hit
        attack += attacker.stats.assault[attacker.element];

        // Add assault permanent bonus
        attack += attacker.allAssaultBonus;

        // Add assault elemental bonus
        attack += attacker.assaultElementalBonus[attacker.element];

        // Add next assault bonus
        attack += attacker.nextAssaultBonus;
        attacker.nextAssaultBonus = 0;

        // Add next assault multiplier
        attack *= attacker.nextAssaultMultiplier;
        attacker.nextAssaultMultiplier = 1;
    }

    // Add random attack bonus: up to 33%
    let random_attack_bonus = Math.random() * attack / 3;
    attack += random_attack_bonus;

    // Apply global attack factor
    attack *= ATTACK_GLOBAL_FACTOR;

    // if (!fixedDamage) {
    // }

    // Calculate the opponent's defense score
    // TODO for multi-element skills, there's a different calculation to use
    defense += opponent.stats.defense[attack_element];

    // Add armor to the defense unless the attacker cancels it
    if (!attacker.cancelArmor) {
        defense += opponent.stats.special.armor ?? 0;
    }

    let damage = attack - defense;

    damage = Math.round(damage);

    // if (!fixedDamage) {
    // }

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
