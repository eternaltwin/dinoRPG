import { DetailedFighter } from "@drpg/core/models/fight/DetailedFighter";

const BASE_ATTACK_VALUE = 2;
const BASE_DEFENSE_VALUE = 0;

const getDamage = (
  fighter: DetailedFighter,
  opponent: DetailedFighter,
) => {
  const base = fighter.stats.assault[fighter.element];

  let damage = BASE_ATTACK_VALUE
		+ base
		+ fighter.nextHitBonus
		- BASE_DEFENSE_VALUE
		- opponent.stats.defense[fighter.element];

	// Armor
	if (!fighter.cancelArmor) {
		damage -= opponent.stats.special.armor ?? 0;
	}

	damage *= fighter.nextHitMultiplier;

	damage = Math.round(damage);

  // Set minimum damage
  if (damage < fighter.minDamage) {
    damage = fighter.minDamage;
  }

  return damage;
};

export default getDamage;
