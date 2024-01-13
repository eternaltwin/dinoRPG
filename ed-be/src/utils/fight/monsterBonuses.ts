import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { Boss } from "@drpg/core/models/fight/BossList";
import { DetailedFighter } from "@drpg/core/models/fight/DetailedFighter";
import { Monster } from "@drpg/core/models/fight/MonsterList";

export const MonsterBonus: Partial<Record<Monster | Boss, (monster: DetailedFighter) => void>> = {
	[Monster.GOBLIN]: (monster) => {
		// +50% counter
		monster.stats.special.counter += 50;

		// +30% multi
		monster.stats.special.multihit += 30;
	},
	[Monster.DARK_SMASHROOM]: (monster) => {
		// x2 M_RENFORTS probability
		const renforts = monster.skills.find((skill) => skill.id === Skill.M_RENFORTS);

		if (renforts) {
			renforts.probability = (renforts.probability ?? 0) * 2;
		}
	},
	[Monster.EARTHWORM_MATRIARCH]: (monster) => {
		// +1 armor
		monster.stats.special.armor += 1;

		// Can hit flying
		monster.canHitFlying = true;

		// Start at half health
		monster.hp = monster.startingHp / 2;
	},
};
