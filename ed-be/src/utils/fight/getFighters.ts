import { Skill, skillList } from "@drpg/core/models/dinoz/SkillList";
import { Stat } from "@drpg/core/models/enums/SkillStat";
import { DetailedFighter, FighterStatus } from "@drpg/core/models/fight/DetailedFighter";
import { MonsterFiche } from "@drpg/core/models/fight/MonsterFiche";
import { itemList } from "@drpg/core/models/item/ItemList";
import { AssaultElement, getAssaultStat } from "@drpg/core/utils/getAssaultStat";
import { DefenseElement, getDefenseStat } from "@drpg/core/utils/getDefenseStat";
import { SpecialStat, getSpecialStat } from "@drpg/core/utils/getSpecialStat";
import { DinozToCalculateFight } from "../../business/fightService.js";

interface Team {
  dinozList: DinozToCalculateFight[];
  monsterList: MonsterFiche[];
	[Skill.ELECTROLYSE]?: boolean;
	[Skill.CHEF_DE_GUERRE]?: boolean;
	[Skill.GARDE_FORESTIER]?: boolean;
}

export const initializeDinoz = (
	team: Team | null,
	teamIndex: number,
	dinoz: DinozToCalculateFight
) => {
	// Find items
	const items = dinoz.items.map((item) => {
		const itemFiche = Object.values(itemList).find((i) => i.itemId === item.itemId);

		if (!itemFiche) {
			throw new Error(`Item ${item.itemId} not found`);
		}

		return itemFiche;
	});

	// Find skills
	const skills = dinoz.skills.map((skill) => {
		const skillFiche = skillList[skill.skillId as Skill]

		if (!skillFiche) {
			throw new Error(`Skill ${skill.skillId} not found`);
		}

		return skillFiche;
	});

	const dinozWithItems = {
		...dinoz,
		items: dinoz.items.map((item) => item.itemId),
	};

	const fighter: DetailedFighter = {
		id: dinoz.id,
		name: dinoz.name,
		level: dinoz.level,
		type: 'dinoz' as const,
		attacker: teamIndex === 0,
		maxHp: dinoz.life,
		hp: dinoz.life,
		energy: 100,
		stats: {
			base: {
				[AssaultElement.AIR]: dinoz.nbrUpAir,
				[AssaultElement.FIRE]: dinoz.nbrUpFire,
				[AssaultElement.LIGHTNING]: dinoz.nbrUpLightning,
				[AssaultElement.WATER]: dinoz.nbrUpWater,
				[AssaultElement.WOOD]: dinoz.nbrUpWood,
			},
			assault: {
				[AssaultElement.AIR]: getAssaultStat(dinoz, skills, AssaultElement.AIR).value,
				[AssaultElement.FIRE]: getAssaultStat(dinoz, skills, AssaultElement.FIRE).value,
				[AssaultElement.LIGHTNING]: getAssaultStat(dinoz, skills, AssaultElement.LIGHTNING).value,
				[AssaultElement.WATER]: getAssaultStat(dinoz, skills, AssaultElement.WATER).value,
				[AssaultElement.WOOD]: getAssaultStat(dinoz, skills, AssaultElement.WOOD).value,
			},
			defense: {
				[DefenseElement.AIR]: getDefenseStat(dinoz, skills, DefenseElement.AIR).value,
				[DefenseElement.FIRE]: getDefenseStat(dinoz, skills, DefenseElement.FIRE).value,
				[DefenseElement.LIGHTNING]: getDefenseStat(dinoz, skills, DefenseElement.LIGHTNING).value,
				[DefenseElement.WATER]: getDefenseStat(dinoz, skills, DefenseElement.WATER).value,
				[DefenseElement.WOOD]: getDefenseStat(dinoz, skills, DefenseElement.WOOD).value,
				[DefenseElement.NEUTRAL]: getDefenseStat(dinoz, skills, DefenseElement.NEUTRAL).value,
			},
			special: {
				[SpecialStat.INITIATIVE]: getSpecialStat(dinozWithItems, skills, SpecialStat.INITIATIVE)?.value,
				[SpecialStat.ENERGY]: getSpecialStat(dinozWithItems, skills, SpecialStat.ENERGY)?.value,
				[SpecialStat.ENERGY_RECOVERY]: getSpecialStat(dinozWithItems, skills, SpecialStat.ENERGY_RECOVERY)?.value,
				[SpecialStat.ARMOR]: getSpecialStat(dinozWithItems, skills, SpecialStat.ARMOR)?.value,
				[SpecialStat.MULTIHIT]: getSpecialStat(dinozWithItems, skills, SpecialStat.MULTIHIT)?.value,
				[SpecialStat.EVASION]: getSpecialStat(dinozWithItems, skills, SpecialStat.EVASION)?.value,
				[SpecialStat.COUNTER]: getSpecialStat(dinozWithItems, skills, SpecialStat.COUNTER)?.value,
				[SpecialStat.BUBBLE_RATE]: getSpecialStat(dinozWithItems, skills, SpecialStat.BUBBLE_RATE)?.value,
				[SpecialStat.TORCH_DAMAGE]: getSpecialStat(dinozWithItems, skills, SpecialStat.TORCH_DAMAGE)?.value,
				[SpecialStat.ACID_BLOOD_DAMAGE]: getSpecialStat(dinozWithItems, skills, SpecialStat.ACID_BLOOD_DAMAGE)?.value,
			},
			speed: {
				[AssaultElement.AIR]: 1,
				[AssaultElement.FIRE]: 1,
				[AssaultElement.LIGHTNING]: 1,
				[AssaultElement.WATER]: 1,
				[AssaultElement.WOOD]: 1,
				global: 1,
			},
		},
		items,
		itemsUsed: [],
		initiative: 0,
		skills,
		status: [],
		activeSkills: [],
		elements: [],
		element: AssaultElement.AIR,
		minDamage: 1,
		nextHitBonus: 0,
		nextHitMultiplier: 1,
	};

	handleSkills(team, fighter);

	// Order skills by priority, random if equal
	fighter.skills.sort((a, b) => {
		const aPriority = a.priority ?? 0;
		const bPriority = b.priority ?? 0;

		if (aPriority !== bPriority) {
			return bPriority - aPriority;
		}

		return Math.random() > 0.5 ? 1 : -1;
	});

	// Initiative
	fighter.initiative -= (fighter.stats.special.initiative ?? 0) / 10;

	// Energy
	fighter.energy = (fighter.stats.special.energy ?? 1) * 100;

	// Handle elements (from highest to lowest)
	const elements = [
		{ element: AssaultElement.FIRE, value: fighter.stats.assault[AssaultElement.FIRE] },
		{ element: AssaultElement.WOOD, value: fighter.stats.assault[AssaultElement.WOOD] },
		{ element: AssaultElement.WATER, value: fighter.stats.assault[AssaultElement.WATER] },
		{ element: AssaultElement.LIGHTNING, value: fighter.stats.assault[AssaultElement.LIGHTNING] },
		{ element: AssaultElement.AIR, value: fighter.stats.assault[AssaultElement.AIR] },
	];

	elements.sort((a, b) => b.value - a.value);

	fighter.elements = elements.map((element) => element.element);
	fighter.element = fighter.elements[0];

	return fighter;
};

export const initializeMonster = (
	existingMonsters: Record<string, number>,
	teamIndex: number,
	monster: MonsterFiche,
) => {
	existingMonsters[monster.name] = (existingMonsters[monster.name] ?? 0) + 1;

	return {
		id: existingMonsters[monster.name],
		name: monster.name,
		level: monster.level,
		type: 'monster' as const,
		attacker: teamIndex === 0,
		maxHp: monster.hp,
		hp: monster.hp,
		energy: 100,
		stats: {
			base: {
				[AssaultElement.AIR]: monster.elements.air,
				[AssaultElement.FIRE]: monster.elements.fire,
				[AssaultElement.LIGHTNING]: monster.elements.lightning,
				[AssaultElement.WATER]: monster.elements.water,
				[AssaultElement.WOOD]: monster.elements.wood,
			},
			assault: {
				[AssaultElement.AIR]: monster.elements.air + (monster.bonus_attack ?? 0),
				[AssaultElement.FIRE]: monster.elements.fire + (monster.bonus_attack ?? 0),
				[AssaultElement.LIGHTNING]: monster.elements.lightning + (monster.bonus_attack ?? 0),
				[AssaultElement.WATER]: monster.elements.water + (monster.bonus_attack ?? 0),
				[AssaultElement.WOOD]: monster.elements.wood + (monster.bonus_attack ?? 0),
			},
			defense: {
				[DefenseElement.AIR]: monster.elements.air + (monster.bonus_defense ?? 0),
				[DefenseElement.FIRE]: monster.elements.fire + (monster.bonus_defense ?? 0),
				[DefenseElement.LIGHTNING]: monster.elements.lightning + (monster.bonus_defense ?? 0),
				[DefenseElement.WATER]: monster.elements.water + (monster.bonus_defense ?? 0),
				[DefenseElement.WOOD]: monster.elements.wood + (monster.bonus_defense ?? 0),
				[DefenseElement.NEUTRAL]: monster.bonus_defense ?? 0,
			},
			special: {
				[SpecialStat.INITIATIVE]: 0,
				[SpecialStat.ENERGY]: 0,
				[SpecialStat.ENERGY_RECOVERY]: 0,
				[SpecialStat.ARMOR]: 0,
				[SpecialStat.MULTIHIT]: 0,
				[SpecialStat.EVASION]: 0,
				[SpecialStat.COUNTER]: 0,
				[SpecialStat.BUBBLE_RATE]: 0,
				[SpecialStat.TORCH_DAMAGE]: 0,
				[SpecialStat.ACID_BLOOD_DAMAGE]: 0,
			},
			speed: {
				[AssaultElement.AIR]: 1,
				[AssaultElement.FIRE]: 1,
				[AssaultElement.LIGHTNING]: 1,
				[AssaultElement.WATER]: 1,
				[AssaultElement.WOOD]: 1,
				global: 1,
			},
		},
		items: [],
		itemsUsed: [],
		initiative: 0,
		skills: [],
		status: [],
		activeSkills: [],
		elements: [
			AssaultElement.FIRE,
			AssaultElement.WOOD,
			AssaultElement.WATER,
			AssaultElement.LIGHTNING,
			AssaultElement.AIR,
		],
		element: AssaultElement.FIRE,
		minDamage: 1,
		nextHitBonus: 0,
		nextHitMultiplier: 1,
	};
};

const handleSkills = (team: Team | null, fighter: DetailedFighter) => {
	const fighterHas = fighter.skills.reduce((acc, skill) => {
		acc[skill.id as Skill] = true;

		// Process speed changes
		if (skill.effects?.[Stat.FIRE_SPEED]) {
			fighter.stats.speed[AssaultElement.FIRE] -= skill.effects[Stat.FIRE_SPEED];
		}
		if (skill.effects?.[Stat.WATER_SPEED]) {
			fighter.stats.speed[AssaultElement.WATER] -= skill.effects[Stat.WATER_SPEED];
		}
		if (skill.effects?.[Stat.WOOD_SPEED]) {
			fighter.stats.speed[AssaultElement.WOOD] -= skill.effects[Stat.WOOD_SPEED];
		}
		if (skill.effects?.[Stat.LIGHTNING_SPEED]) {
			fighter.stats.speed[AssaultElement.LIGHTNING] -= skill.effects[Stat.LIGHTNING_SPEED];
		}
		if (skill.effects?.[Stat.AIR_SPEED]) {
			fighter.stats.speed[AssaultElement.AIR] -= skill.effects[Stat.AIR_SPEED];
		}

		return acc;
	}, {} as Record<Skill, boolean>);

	// FIRE
	if (fighterHas[Skill.CHARGE]) {
		fighter.nextHitBonus += 5;
	}

	if (fighterHas[Skill.BELIER]) {
		fighter.nextHitBonus += 20;
	}

	if (team && fighterHas[Skill.CHEF_DE_GUERRE]) {
		team[Skill.CHEF_DE_GUERRE] = true;
	}

	if (fighterHas[Skill.TORCHE]) {
		fighter.status.push(FighterStatus.TORCHED);
	}

	// WOOD
  if (fighterHas[Skill.TENACITE]) {
		fighter.minDamage += 1;
	}

  if (team && fighterHas[Skill.GARDE_FORESTIER]) {
		team[Skill.GARDE_FORESTIER] = true;
	}

	// WATER
	if (fighterHas[Skill.PERCEPTION]) {
		fighter.canHitIntangible = true;
	}

	if (fighterHas[Skill.KARATE_SOUS_MARIN]) {
		fighter.stats.base[AssaultElement.WATER] += 10;
	}

	// AIR
  if (fighterHas[Skill.SAUT]) {
		fighter.canHitFlying = true;
	}

	// 50% chance to get positive / negative initiative
  if (fighterHas[Skill.DOUBLE_FACE]) {
		fighter.initiative += Math.random() > 0.5 ? 1 : -1;
	}

	// RACE
	if (fighterHas[Skill.CHARGE_CORNUE]) {
		fighter.nextHitMultiplier += 0.2;
	}

	if (fighterHas[Skill.PIETINEMENT]) {
		fighter.cancelArmor = true;
	}

	// DOUBLE
	if (team && fighterHas[Skill.ELECTROLYSE]) {
		team[Skill.ELECTROLYSE] = true;
	}

	// SPHERE
	if (fighterHas[Skill.SURVIE]) {
		fighter.canSurvive = true;
	}

	// TODO: handle other skills
};

const getFighters = (team1: Team, team2: Team): DetailedFighter[] => {
  const fighters: DetailedFighter[] = [];

	const existingMonsters: Record<string, number> = {};

  [team1, team2].forEach((team, index) => {
    const { dinozList, monsterList } = team;

		// Dinoz
		fighters.push(...dinozList.map((dinoz) => initializeDinoz(team, index, dinoz)));

		// Monsters
		fighters.push(...monsterList.map((monster) => initializeMonster(existingMonsters, index, monster)));
	});

	// Handle team wide modifiers
	fighters.forEach((fighter) => {
		const team = fighter.attacker ? team1 : team2;

		// FIRE
		if (team[Skill.CHEF_DE_GUERRE]) {
			fighter.stats.assault[AssaultElement.AIR] += 2;
			fighter.stats.defense[DefenseElement.FIRE] += 2;
			fighter.stats.defense[DefenseElement.WOOD] += 2;
			fighter.stats.defense[DefenseElement.WATER] += 2;
			fighter.stats.defense[DefenseElement.LIGHTNING] += 2;
		}
		// WOOD
		if (team[Skill.GARDE_FORESTIER]) {
			fighter.stats.defense[DefenseElement.WOOD] += 3;
		}
		// LIGHTNING
		if (team[Skill.ELECTROLYSE]) {
			fighter.stats.speed.global -= 0.05;
		}
	});

  return fighters;
};

export default getFighters;
