import { Skill, skillList } from "@drpg/core/models/dinoz/SkillList";
import { statusList } from "@drpg/core/models/dinoz/StatusList";
import { ElementType } from "@drpg/core/models/enums/ElementType";
import { MapZone } from "@drpg/core/models/enums/MapZone";
import { PlaceEnum } from "@drpg/core/models/enums/PlaceEnum";
import { Stat } from "@drpg/core/models/enums/SkillStat";
import { DetailedFighter, FighterStatus, Status } from "@drpg/core/models/fight/DetailedFighter";
import { MonsterFiche } from "@drpg/core/models/fight/MonsterFiche";
import { monsterList } from "@drpg/core/models/fight/MonsterList";
import { Item, itemList } from "@drpg/core/models/item/ItemList";
import { PlacesByMap } from "@drpg/core/models/place/PlaceList";
import { AssaultElement, getAssaultStat } from "@drpg/core/utils/getAssaultStat";
import { DefenseElement, getDefenseStat } from "@drpg/core/utils/getDefenseStat";
import { SpecialStat, getSpecialStat } from "@drpg/core/utils/getSpecialStat";
import { DinozToCalculateFight } from "../../business/fightService.js";
import { TIME_BASE, TIME_FACTOR } from "./fightConstants.js";
import { createStatus } from "./fightMethods.js";
import { getBasicElementDamage } from "./getDamage.js";
import { MonsterBonus } from "./monsterBonuses.js";

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
	dinoz: DinozToCalculateFight,
	place: PlaceEnum,
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
		const skillDetails = skillList[skill.skillId as Skill]

		if (!skillDetails) {
			throw new Error(`Skill ${skill.skillId} not found`);
		}

		return { ...skillDetails };
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
				[ElementType.AIR]: dinoz.nbrUpAir,
				[ElementType.FIRE]: dinoz.nbrUpFire,
				[ElementType.LIGHTNING]: dinoz.nbrUpLightning,
				[ElementType.WATER]: dinoz.nbrUpWater,
				[ElementType.WOOD]: dinoz.nbrUpWood,
				[ElementType.VOID]: 0,
			},
			assaultBonus: {
				[ElementType.AIR]: getAssaultStat(dinoz, skills, AssaultElement.AIR).bonus,
				[ElementType.FIRE]: getAssaultStat(dinoz, skills, AssaultElement.FIRE).bonus,
				[ElementType.LIGHTNING]: getAssaultStat(dinoz, skills, AssaultElement.LIGHTNING).bonus,
				[ElementType.WATER]: getAssaultStat(dinoz, skills, AssaultElement.WATER).bonus,
				[ElementType.WOOD]: getAssaultStat(dinoz, skills, AssaultElement.WOOD).bonus,
				[ElementType.VOID]: 0,
			},
			defense: {
				[ElementType.AIR]: getDefenseStat(dinoz, skills, DefenseElement.AIR).value,
				[ElementType.FIRE]: getDefenseStat(dinoz, skills, DefenseElement.FIRE).value,
				[ElementType.LIGHTNING]: getDefenseStat(dinoz, skills, DefenseElement.LIGHTNING).value,
				[ElementType.WATER]: getDefenseStat(dinoz, skills, DefenseElement.WATER).value,
				[ElementType.WOOD]: getDefenseStat(dinoz, skills, DefenseElement.WOOD).value,
				[ElementType.VOID]: getDefenseStat(dinoz, skills, DefenseElement.NEUTRAL).value,
			},
			special: {
				[SpecialStat.INITIATIVE]: getSpecialStat(dinozWithItems, skills, SpecialStat.INITIATIVE)?.value ?? 0,
				[SpecialStat.ENERGY]: getSpecialStat(dinozWithItems, skills, SpecialStat.ENERGY)?.value ?? 0,
				[SpecialStat.ENERGY_RECOVERY]: getSpecialStat(dinozWithItems, skills, SpecialStat.ENERGY_RECOVERY)?.value ?? 0,
				[SpecialStat.ARMOR]: getSpecialStat(dinozWithItems, skills, SpecialStat.ARMOR)?.value ?? 0,
				[SpecialStat.MULTIHIT]: getSpecialStat(dinozWithItems, skills, SpecialStat.MULTIHIT)?.value ?? 0,
				[SpecialStat.EVASION]: getSpecialStat(dinozWithItems, skills, SpecialStat.EVASION)?.value ?? 0,
				[SpecialStat.COUNTER]: getSpecialStat(dinozWithItems, skills, SpecialStat.COUNTER)?.value ?? 0,
				[SpecialStat.BUBBLE_RATE]: getSpecialStat(dinozWithItems, skills, SpecialStat.BUBBLE_RATE)?.value ?? 0,
				[SpecialStat.TORCH_DAMAGE]: getSpecialStat(dinozWithItems, skills, SpecialStat.TORCH_DAMAGE)?.value ?? 0,
				[SpecialStat.ACID_BLOOD_DAMAGE]: getSpecialStat(dinozWithItems, skills, SpecialStat.ACID_BLOOD_DAMAGE)?.value ?? 0,
			},
			speed: {
				[ElementType.AIR]: 1,
				[ElementType.FIRE]: 1,
				[ElementType.LIGHTNING]: 1,
				[ElementType.WATER]: 1,
				[ElementType.WOOD]: 1,
				[ElementType.VOID]: 1,
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
		element: ElementType.AIR,
		minDamage: 1,
		minAssaultDamage: 1,
		skillElementalBonus: {
			[ElementType.AIR]: 0,
			[ElementType.FIRE]: 0,
			[ElementType.LIGHTNING]: 0,
			[ElementType.WATER]: 0,
			[ElementType.WOOD]: 0,
			[ElementType.VOID]: 0,
		},
		nextAssaultBonus: 0,
		nextAssaultMultiplier: 1,
		costume,
		invocations: 1,
		initiallyCursed: dinoz.status.some((status) => status.statusId === statusList.CURSED),
	};

	handleSkills(team, fighter, place);

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
	let initiative = fighter.stats.special.initiative;

	// Temporal reduction
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
		{ element: ElementType.FIRE, value: fighter.stats.base[ElementType.FIRE] },
		{ element: ElementType.WOOD, value: fighter.stats.base[ElementType.WOOD] },
		{ element: ElementType.WATER, value: fighter.stats.base[ElementType.WATER] },
		{ element: ElementType.LIGHTNING, value: fighter.stats.base[ElementType.LIGHTNING] },
		{ element: ElementType.AIR, value: fighter.stats.base[ElementType.AIR] },
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
	memory: {
		existingMonsters: number,
		renfortApplied: number,
	},
	team: Team | null,
	teamIndex: number,
	monster: MonsterFiche,
	place: PlaceEnum,
): DetailedFighter => {
	memory.existingMonsters++;

	// Find skills
	const skills = monster.skills?.map((skill) => {
		const skillDetails = skillList[skill]

		if (!skillDetails) {
			throw new Error(`Skill ${skill} not found`);
		}

		// Reduce probability by 3.5 for each consecutive M_RENFORTS
		let probability = skillDetails.probability ?? 0;

		if (skill === Skill.M_RENFORTS) {
			probability -= 3.5 * (memory.renfortApplied);
			memory.renfortApplied++;
		}

		return {
			...skillDetails,
			probability,
		};
	}) ?? [];

	// Statuses
	const status: FighterStatus[] = [];

	if (monster.noMove) {
		status.push(createStatus(Status.NO_ASSAULT));
	}

	const similiDinoz = {
		nbrUpFire: monster.elements.fire,
		nbrUpWood: monster.elements.wood,
		nbrUpLightning: monster.elements.lightning,
		nbrUpAir: monster.elements.air,
		nbrUpWater: monster.elements.water,
		items: [],
	};

	const fighter: DetailedFighter = {
		id: -memory.existingMonsters,
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
				[ElementType.AIR]: monster.elements.air,
				[ElementType.FIRE]: monster.elements.fire,
				[ElementType.LIGHTNING]: monster.elements.lightning,
				[ElementType.WATER]: monster.elements.water,
				[ElementType.WOOD]: monster.elements.wood,
				[ElementType.VOID]: 0,
			},
			assaultBonus: {
				[ElementType.AIR]: getAssaultStat(similiDinoz, skills, AssaultElement.AIR).bonus + (monster.bonus_attack ?? 0),
				[ElementType.FIRE]: getAssaultStat(similiDinoz, skills, AssaultElement.FIRE).bonus + (monster.bonus_attack ?? 0),
				[ElementType.LIGHTNING]: getAssaultStat(similiDinoz, skills, AssaultElement.LIGHTNING).bonus + (monster.bonus_attack ?? 0),
				[ElementType.WATER]: getAssaultStat(similiDinoz, skills, AssaultElement.WATER).bonus + (monster.bonus_attack ?? 0),
				[ElementType.WOOD]: getAssaultStat(similiDinoz, skills, AssaultElement.WOOD).bonus + (monster.bonus_attack ?? 0),
				[ElementType.VOID]: 0,
			},
			defense: {
				[ElementType.AIR]: getDefenseStat(similiDinoz, skills, DefenseElement.AIR).value + (monster.bonus_defense ?? 0),
				[ElementType.FIRE]: getDefenseStat(similiDinoz, skills, DefenseElement.FIRE).value + (monster.bonus_defense ?? 0),
				[ElementType.LIGHTNING]: getDefenseStat(similiDinoz, skills, DefenseElement.LIGHTNING).value + (monster.bonus_defense ?? 0),
				[ElementType.WATER]: getDefenseStat(similiDinoz, skills, DefenseElement.WATER).value + (monster.bonus_defense ?? 0),
				[ElementType.WOOD]: getDefenseStat(similiDinoz, skills, DefenseElement.WOOD).value + (monster.bonus_defense ?? 0),
				[ElementType.VOID]: getDefenseStat(similiDinoz, skills, DefenseElement.NEUTRAL).value + (monster.bonus_defense ?? 0)
			},
			special: {
				[SpecialStat.INITIATIVE]: getSpecialStat(similiDinoz, skills, SpecialStat.INITIATIVE)?.value ?? 0,
				[SpecialStat.ENERGY]: getSpecialStat(similiDinoz, skills, SpecialStat.ENERGY)?.value ?? 0,
				[SpecialStat.ENERGY_RECOVERY]: getSpecialStat(similiDinoz, skills, SpecialStat.ENERGY_RECOVERY)?.value ?? 0,
				[SpecialStat.ARMOR]: getSpecialStat(similiDinoz, skills, SpecialStat.ARMOR)?.value ?? 0,
				[SpecialStat.MULTIHIT]: getSpecialStat(similiDinoz, skills, SpecialStat.MULTIHIT)?.value ?? 0,
				[SpecialStat.EVASION]: getSpecialStat(similiDinoz, skills, SpecialStat.EVASION)?.value ?? 0,
				[SpecialStat.COUNTER]: getSpecialStat(similiDinoz, skills, SpecialStat.COUNTER)?.value ?? 0,
				[SpecialStat.BUBBLE_RATE]: getSpecialStat(similiDinoz, skills, SpecialStat.BUBBLE_RATE)?.value ?? 0,
				[SpecialStat.TORCH_DAMAGE]: getSpecialStat(similiDinoz, skills, SpecialStat.TORCH_DAMAGE)?.value ?? 0,
				[SpecialStat.ACID_BLOOD_DAMAGE]: getSpecialStat(similiDinoz, skills, SpecialStat.ACID_BLOOD_DAMAGE)?.value ?? 0,
			},
			speed: {
				[ElementType.AIR]: 1,
				[ElementType.FIRE]: 1,
				[ElementType.LIGHTNING]: 1,
				[ElementType.WATER]: 1,
				[ElementType.WOOD]: 1,
				[ElementType.VOID]: 1,
				global: 1,
			},
		},
		items: [],
		itemsUsed: [],
		// Add a random amount of time between 0 and 10 to randomize the first fighter
		time: Math.round(Math.random() * TIME_BASE) * TIME_FACTOR,
		skills,
		status,
		activeSkills: [],
		elements: [
			ElementType.FIRE,
			ElementType.WOOD,
			ElementType.WATER,
			ElementType.LIGHTNING,
			ElementType.AIR,
			ElementType.VOID,
		],
		element: ElementType.FIRE,
		minDamage: 1,
		minAssaultDamage: 1,
		skillElementalBonus: {
			[ElementType.AIR]: 0,
			[ElementType.FIRE]: 0,
			[ElementType.LIGHTNING]: 0,
			[ElementType.WATER]: 0,
			[ElementType.WOOD]: 0,
			[ElementType.VOID]: 0,
		},
		nextAssaultBonus: 0,
		nextAssaultMultiplier: 1,
		invocations: 0,
		initiallyCursed: false,
	};

	// Handle bonuses
	const handleMonsterBonuses = MonsterBonus[monster.id];

	if (handleMonsterBonuses) {
		handleMonsterBonuses(fighter);
	}

	// Skills
	handleSkills(team, fighter, place);

	// Handle elements (from highest to lowest)
	const elements = [
		{ element: ElementType.FIRE, value: fighter.stats.base[ElementType.FIRE] },
		{ element: ElementType.WOOD, value: fighter.stats.base[ElementType.WOOD] },
		{ element: ElementType.WATER, value: fighter.stats.base[ElementType.WATER] },
		{ element: ElementType.LIGHTNING, value: fighter.stats.base[ElementType.LIGHTNING] },
		{ element: ElementType.AIR, value: fighter.stats.base[ElementType.AIR] },
		{ element: ElementType.VOID, value: fighter.stats.base[ElementType.VOID] },
	];

	// Order the elements from highest to lowest, random if equal
	elements.sort((a, b) => {
		if (b.value !== a.value) {
			return b.value - a.value
		}
		return Math.random() > 0.5 ? 1 : -1;
		}
	);

	// Filter out elements with 0 value
	fighter.elements = elements.filter((element) => element.value > 0).map((element) => element.element);

	if (fighter.elements.length === 0) {
		fighter.elements = [ElementType.VOID];
	}

	fighter.element = fighter.elements[0];

	return fighter;
};

const handleSkills = (
	team: Team | null,
	fighter: DetailedFighter,
	place: PlaceEnum,
) => {
	const fighterHas = fighter.skills.reduce((acc, skill) => {
		acc[skill.id as Skill] = true;

		// Process speed changes
		if (skill.effects?.[Stat.SPEED]) {
			fighter.stats.speed.global *= skill.effects[Stat.SPEED];
		}
		if (skill.effects?.[Stat.FIRE_SPEED]) {
			fighter.stats.speed[ElementType.FIRE] *= skill.effects[Stat.FIRE_SPEED];
		}
		if (skill.effects?.[Stat.WATER_SPEED]) {
			fighter.stats.speed[ElementType.WATER] *= skill.effects[Stat.WATER_SPEED];
		}
		if (skill.effects?.[Stat.WOOD_SPEED]) {
			fighter.stats.speed[ElementType.WOOD] *= skill.effects[Stat.WOOD_SPEED];
		}
		if (skill.effects?.[Stat.LIGHTNING_SPEED]) {
			fighter.stats.speed[ElementType.LIGHTNING] *= skill.effects[Stat.LIGHTNING_SPEED];
		}
		if (skill.effects?.[Stat.AIR_SPEED]) {
			fighter.stats.speed[ElementType.AIR] *= skill.effects[Stat.AIR_SPEED];
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
		fighter.status.push(createStatus(Status.TORCHED));
		fighter.stats.defense[ElementType.FIRE] += 10;
	}

	// WOOD
	if (fighterHas[Skill.TENACITE]) {
		fighter.minDamage += 1;
	}

	if (team && fighterHas[Skill.GARDE_FORESTIER]) {
		team[Skill.GARDE_FORESTIER] = true;
	}

	if (fighterHas[Skill.FORCE_CONTROL]) {
		if (fighter.minAssaultDamage < 10) {
			fighter.minAssaultDamage = 10;
		}
	}

	// WATER
	if (fighterHas[Skill.PERCEPTION]) {
		fighter.canHitIntangible = true;
	}

	if (fighterHas[Skill.KARATE_SOUS_MARIN]) {
		fighter.skillElementalBonus[ElementType.WATER] += 10;
	}

	if (fighterHas[Skill.ACUPUNCTURE]) {
		fighter.status.push(createStatus(Status.HEALING));
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

	if (fighterHas[Skill.ROUGE]) {
		// +20 assault damage if on GTOUTCHAUD
		if (PlacesByMap[MapZone.GTOUTCHAUD]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 20;
			fighter.stats.assaultBonus[ElementType.FIRE] += 20;
			fighter.stats.assaultBonus[ElementType.WOOD] += 20;
			fighter.stats.assaultBonus[ElementType.WATER] += 20;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 20;
		}
	}

	if (fighterHas[Skill.VERT]) {
		// +20 assault damage if on JUNGLE
		if (PlacesByMap[MapZone.JUNGLE]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 20;
			fighter.stats.assaultBonus[ElementType.FIRE] += 20;
			fighter.stats.assaultBonus[ElementType.WOOD] += 20;
			fighter.stats.assaultBonus[ElementType.WATER] += 20;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 20;
		}
	}

	if (fighterHas[Skill.BLEU]) {
		// +20 assault damage if on ILES
		if (PlacesByMap[MapZone.ILES]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 20;
			fighter.stats.assaultBonus[ElementType.FIRE] += 20;
			fighter.stats.assaultBonus[ElementType.WOOD] += 20;
			fighter.stats.assaultBonus[ElementType.WATER] += 20;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 20;
		}
	}

	if (fighterHas[Skill.JAUNE]) {
		// +20 assault damage if on STEPPE
		if (PlacesByMap[MapZone.STEPPE]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 20;
			fighter.stats.assaultBonus[ElementType.FIRE] += 20;
			fighter.stats.assaultBonus[ElementType.WOOD] += 20;
			fighter.stats.assaultBonus[ElementType.WATER] += 20;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 20;
		}
	}

	if (fighterHas[Skill.BLANC]) {
		// +20 assault damage if on NIMBAO
		if (PlacesByMap[MapZone.NIMBAO]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 20;
			fighter.stats.assaultBonus[ElementType.FIRE] += 20;
			fighter.stats.assaultBonus[ElementType.WOOD] += 20;
			fighter.stats.assaultBonus[ElementType.WATER] += 20;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 20;
		}
	}

	// RACE
	if (fighterHas[Skill.CHARGE_CORNUE]) {
		fighter.nextAssaultMultiplier *= 1.2;
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

const getFighters = (team1: Team, team2: Team, place: PlaceEnum): DetailedFighter[] => {
  const fighters: DetailedFighter[] = [];

	const memory = {
		existingMonsters: 0,
		renfortApplied: 0,
	};

  [team1, team2].forEach((team, index) => {
	const { dinozList, monsterList } = team;

		// Dinoz
		fighters.push(...dinozList.map((dinoz) => initializeDinoz(team, index, dinoz, place)));

		// Monsters
		fighters.push(...monsterList.map((monster) => initializeMonster(memory, team, index, monster, place)));
	});

	// Handle team wide modifiers
	fighters.forEach((fighter) => {
		const team = fighter.attacker ? team1 : team2;

		// FIRE
		if (team[Skill.CHEF_DE_GUERRE]) {
			fighter.stats.assaultBonus[ElementType.AIR] += 2;
			fighter.stats.assaultBonus[ElementType.FIRE] += 2;
			fighter.stats.assaultBonus[ElementType.WOOD] += 2;
			fighter.stats.assaultBonus[ElementType.WATER] += 2;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 2;
		}
		// WOOD
		if (team[Skill.GARDE_FORESTIER]) {
			fighter.stats.defense[ElementType.WOOD] += 3;
		}
		// LIGHTNING
		if (team[Skill.ELECTROLYSE]) {
			fighter.stats.speed.global *= 0.95;
		}

		// ITEMS
		if (team1[Item.EMBER] || team2[Item.EMBER]) {
			fighter.stats.assaultBonus[ElementType.FIRE] += getBasicElementDamage(fighter, ElementType.FIRE) * 0.3;
		}
		if (team1[Item.BEER] || team2[Item.BEER]) {
			fighter.status.push(createStatus(Status.BEER));
		}
	});

  return fighters;
};

export default getFighters;
