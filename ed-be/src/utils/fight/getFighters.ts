import { Skill, skillList } from "@drpg/core/models/dinoz/SkillList";
import { Stat } from "@drpg/core/models/enums/SkillStat";
import { DetailedFighter, FighterStatus } from "@drpg/core/models/fight/DetailedFighter";
import { MonsterFiche } from "@drpg/core/models/fight/MonsterFiche";
import { Item, itemList } from "@drpg/core/models/item/ItemList";
import { AssaultElement, getAssaultStat } from "@drpg/core/utils/getAssaultStat";
import { DefenseElement, getDefenseStat } from "@drpg/core/utils/getDefenseStat";
import { SpecialStat, getSpecialStat } from "@drpg/core/utils/getSpecialStat";
import { DinozToCalculateFight } from "../../business/fightService.js";
import { TIME_BASE, TIME_FACTOR } from "./fightConstants.js";
import { monsterList } from "@drpg/core/models/fight/MonsterList";

interface Team {
  dinozList: DinozToCalculateFight[];
  monsterList: MonsterFiche[];
	[Skill.ELECTROLYSE]?: boolean;
	[Skill.CHEF_DE_GUERRE]?: boolean;
	[Skill.GARDE_FORESTIER]?: boolean;
	[Item.EMBER]?: boolean;
	[Item.BEER]?: boolean;
}

export const initializeDinoz = (
	team: Team | null,
	teamIndex: number,
	dinoz: DinozToCalculateFight
) => {
	// Costume
	let costume: MonsterFiche | undefined = undefined;

	// Find items
	const items = dinoz.items.map((item) => {
		const itemFiche = Object.values(itemList).find((i) => i.itemId === item.itemId);

		if (!itemFiche) {
			throw new Error(`Item ${item.itemId} not found`);
		}

		// Add bamboo monster
		if (team && itemFiche.itemId === Item.BAMBOO_FRIEND) {
			team.monsterList.push(monsterList.BAMBOOZ_SPROUTING);
		}

		// Set costume
		if (team && itemFiche.itemId === Item.VEGETOX_COSTUME) {
			costume = monsterList.VEGETOX_GUARD;
		}
		if (team && itemFiche.itemId === Item.GOBLIN_COSTUME) {
			costume = monsterList.GOBLIN;
		}

		return { ...itemFiche };
	});

	// Find skills
	const skills = dinoz.skills.map((skill) => {
		const skillFiche = skillList[skill.skillId as Skill]

		if (!skillFiche) {
			throw new Error(`Skill ${skill.skillId} not found`);
		}

		return { ...skillFiche };
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
		maxHp: dinoz.maxLife,
		startingHp: dinoz.life,
		hp: dinoz.life,
		energy: 100,
		maxEnergy: 100,
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
		time: 0,
		skills,
		status: [],
		activeSkills: [],
		elements: [],
		element: AssaultElement.AIR,
		minDamage: 1,
		minAssaultDamage: 1,
		skillElementalBonus: {
			[AssaultElement.AIR]: 0,
			[AssaultElement.FIRE]: 0,
			[AssaultElement.LIGHTNING]: 0,
			[AssaultElement.WATER]: 0,
			[AssaultElement.WOOD]: 0,
		},
		nextAssaultBonus: 0,
		nextAssaultMultiplier: 1,
		costume,
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

	// Time
	let initiative = fighter.stats.special.initiative ?? 0;

	// Temportal reduction
	if (fighter.items.some((item) => item.itemId === Item.TEMPORAL_REDUCTION)) {
		// Reduce by 50%
		initiative *= 0.5;
	}

	// Deduct the time from the fighter's initial time
	fighter.time -= initiative * TIME_FACTOR;
	// Add a random amount of time between 0 and 10 to randomize the first fighter
	fighter.time += Math.round(Math.random() * TIME_BASE) * TIME_FACTOR;

	// Energy
	fighter.energy = (fighter.stats.special.energy ?? 1) * 100;
	fighter.maxEnergy = fighter.energy;

	// Handle elements (from highest to lowest)
	const elements = [
		{ element: AssaultElement.FIRE, value: fighter.stats.base[AssaultElement.FIRE] },
		{ element: AssaultElement.WOOD, value: fighter.stats.base[AssaultElement.WOOD] },
		{ element: AssaultElement.WATER, value: fighter.stats.base[AssaultElement.WATER] },
		{ element: AssaultElement.LIGHTNING, value: fighter.stats.base[AssaultElement.LIGHTNING] },
		{ element: AssaultElement.AIR, value: fighter.stats.base[AssaultElement.AIR] },
	];

	// Order the elements from highest to lowest, random if equal
	elements.sort((a, b) => {
		if (b.value !== a.value) {
			return b.value - a.value
		}
		return Math.random() > 0.5 ? 1 : -1;
		}
	);

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
		startingHp: monster.hp,
		hp: monster.hp,
		energy: 100,
		maxEnergy: 100,
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
		// Add a random amount of time between 0 and 10 to randomize the first fighter
		time: Math.round(Math.random() * TIME_BASE) * TIME_FACTOR,
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
		minAssaultDamage: 1,
		skillElementalBonus: {
			[AssaultElement.AIR]: 0,
			[AssaultElement.FIRE]: 0,
			[AssaultElement.LIGHTNING]: 0,
			[AssaultElement.WATER]: 0,
			[AssaultElement.WOOD]: 0,
		},
		nextAssaultBonus: 0,
		nextAssaultMultiplier: 1,
	};
};

const handleSkills = (team: Team | null, fighter: DetailedFighter) => {
	const fighterHas = fighter.skills.reduce((acc, skill) => {
		acc[skill.id as Skill] = true;

		// TODO this is multiplicative not additive
		// Process speed changes
		if (skill.effects?.[Stat.SPEED]) {
			fighter.stats.speed.global *= skill.effects[Stat.SPEED];
		}
		if (skill.effects?.[Stat.FIRE_SPEED]) {
			fighter.stats.speed[AssaultElement.FIRE] *= skill.effects[Stat.FIRE_SPEED];
		}
		if (skill.effects?.[Stat.WATER_SPEED]) {
			fighter.stats.speed[AssaultElement.WATER] *= skill.effects[Stat.WATER_SPEED];
		}
		if (skill.effects?.[Stat.WOOD_SPEED]) {
			fighter.stats.speed[AssaultElement.WOOD] *= skill.effects[Stat.WOOD_SPEED];
		}
		if (skill.effects?.[Stat.LIGHTNING_SPEED]) {
			fighter.stats.speed[AssaultElement.LIGHTNING] *= skill.effects[Stat.LIGHTNING_SPEED];
		}
		if (skill.effects?.[Stat.AIR_SPEED]) {
			fighter.stats.speed[AssaultElement.AIR] *= skill.effects[Stat.AIR_SPEED];
		}

		return acc;
	}, {} as Record<Skill, boolean>);

	// FIRE
	if (fighterHas[Skill.CHARGE]) {
		fighter.nextAssaultBonus += 5;
	}

	if (fighterHas[Skill.BELIER]) {
		fighter.nextAssaultBonus += 20;
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

	if (fighterHas[Skill.ACUPUNCTURE]) {
		fighter.status.push(FighterStatus.HEALING);
	}

	if (fighterHas[Skill.SAPEUR]) {
		// Increase item use probability by 50%
		fighter.items.forEach((item) => {
			item.probability = (item.probability ?? 0) * 1.5;
		});
	}

	// AIR
	if (fighterHas[Skill.SAUT]) {
		fighter.canHitFlying = true;
	}

	// 50% chance to get positive / negative time
	if (fighterHas[Skill.DOUBLE_FACE]) {
		fighter.time += (Math.random() > 0.5 ? TIME_BASE : -TIME_BASE) * TIME_FACTOR;
	}

	// RACE
	if (fighterHas[Skill.CHARGE_CORNUE]) {
		fighter.nextAssaultMultiplier += 0.2;
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
			fighter.stats.assault[AssaultElement.FIRE] += 2;
			fighter.stats.assault[AssaultElement.WOOD] += 2;
			fighter.stats.assault[AssaultElement.WATER] += 2;
			fighter.stats.assault[AssaultElement.LIGHTNING] += 2;
		}
		// WOOD
		if (team[Skill.GARDE_FORESTIER]) {
			fighter.stats.defense[DefenseElement.WOOD] += 3;
		}
		// LIGHTNING
		if (team[Skill.ELECTROLYSE]) {
			fighter.stats.speed.global *= 0.95;
		}

		// ITEMS
		if (team1[Item.EMBER] || team2[Item.EMBER]) {
			fighter.stats.assault[AssaultElement.FIRE] *= 1.3;
		}
		if (team1[Item.BEER] || team2[Item.BEER]) {
			fighter.status.push(FighterStatus.BEER);
		}
	});

  return fighters;
};

export default getFighters;
