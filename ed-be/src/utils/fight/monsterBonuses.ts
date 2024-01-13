import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { ElementType } from "@drpg/core/models/enums/ElementType";
import { Boss } from "@drpg/core/models/fight/BossList";
import { DetailedFighter, FighterStatus } from "@drpg/core/models/fight/DetailedFighter";
import { Monster } from "@drpg/core/models/fight/MonsterList";

export const MonsterBonus: Partial<Record<Monster | Boss, (monster: DetailedFighter) => void>> = {
	[Monster.GOBLIN]: (monster) => {
		monster.stats.special.counter += 50;
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
		monster.stats.special.armor += 1;
		monster.canHitFlying = true;
		monster.hp = monster.startingHp / 2;
	},
	[Monster.COQ]: (monster) => {
		monster.stats.speed.global *= 0.4;
	},
	[Monster.RONCIV]: (monster) => {
		monster.stats.special.counter += 90;
		monster.status.push(FighterStatus.NO_ASSAULT);
	},
	[Monster.GRDIEN]: (monster) => {
		// Sentinel
		monster.stats.special.counter += 90;
		monster.status.push(FighterStatus.NO_ASSAULT);

		// Comet
		monster.stats.speed.global *= 1.5;
		monster.stats.base[ElementType.WOOD] = 15;
	},
	[Boss.TW_BIGBEASTLY]: (monster) => {
		// x3 CELERITE probability
		const celerite = monster.skills.find((skill) => skill.id === Skill.CELERITE);

		if (celerite) {
			celerite.probability = (celerite.probability ?? 0) * 3;
		}
	},
	[Boss.PR_IGOR]: (monster) => {
		monster.stats.special.evasion += 25;
		monster.stats.speed.global *= 3;
	},
};
