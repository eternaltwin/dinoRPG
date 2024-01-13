import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { ElementType } from "@drpg/core/models/enums/ElementType";
import { Boss } from "@drpg/core/models/fight/BossList";
import { DetailedFighter, FighterStatus } from "@drpg/core/models/fight/DetailedFighter";
import { Monster } from "@drpg/core/models/fight/MonsterList";
import { TIME_FACTOR } from "./fightConstants.js";
import randomBetween from "./randomBetween.js";

const sentinel = (monster: DetailedFighter) => {
	monster.stats.special.counter += 90;
	monster.status.push(FighterStatus.NO_ASSAULT);
};

const elemental = (monster: DetailedFighter) => {
	monster.time += 30 * TIME_FACTOR;
	monster.stats.speed.global *= 3;
	monster.stats.base[ElementType.FIRE] = 10;
	monster.stats.base[ElementType.WOOD] = 10;
	monster.stats.base[ElementType.WATER] = 10;
	monster.stats.base[ElementType.LIGHTNING] = 10;
	monster.stats.base[ElementType.AIR] = 10;
	monster.stats.base[ElementType.VOID] = 10;
	monster.canHitFlying = true;
	monster.canHitIntangible = true;

	const randomElement = randomBetween(1, 6) as ElementType;

	// Lock to a single element
	monster.elements = [randomElement];
	monster.element = randomElement;
};

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
		sentinel(monster);
	},
	[Monster.GRDIEN]: (monster) => {
		sentinel(monster);

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
	[Boss.TOWER_GUARDIAN]: (monster) => {
		elemental(monster);
	},
};
