import { DetailedFighter } from "@drpg/core/models/fight/DetailedFighter";

const getDamage = (
  fighter: DetailedFighter,
  opponent: DetailedFighter,
) => {
  const base = fighter.stats.assault[fighter.element];

  let damage = base - opponent.stats.defense[fighter.element];

  // Set minimum damage
  if (damage < fighter.minDamage) {
    damage = fighter.minDamage;
  }

  return damage;
};

export default getDamage;
