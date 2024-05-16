import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { MapZone } from '@drpg/core/models/enums/MapZone';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { Stat } from '@drpg/core/models/enums/SkillStat';
import { DetailedFighter, FighterStatus, Status } from '@drpg/core/models/fight/DetailedFighter';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { Monster, monsterList } from '@drpg/core/models/fight/MonsterList';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { PlacesByMap } from '@drpg/core/models/place/PlaceList';
import { AssaultElement, getAssaultStat } from '@drpg/core/utils/getAssaultStat';
import { DefenseElement, getDefenseStat } from '@drpg/core/utils/getDefenseStat';
import { SpecialStat, getSpecialStat } from '@drpg/core/utils/getSpecialStat';
import { MAXIMUM_MAX_ENERGY, TIME_BASE, TIME_FACTOR } from './fightConstants.js';
import { createStatus, setEnergy, setMaxEnergy } from './fightMethods.js';
import { getBasicElementDamage } from './getDamage.js';
import { MonsterBonus } from './monsterBonuses.js';
import { DinozToGetFighter } from '@drpg/core/models/fight/FightConfiguration';
import { DetailedFight } from './generateFight.js';

interface Team {
	dinozList: DinozToGetFighter[];
	monsterList: MonsterFiche[];
	[Skill.ELECTROLYSE]?: boolean;
	[Skill.CHEF_DE_GUERRE]?: boolean;
	[Skill.GARDE_FORESTIER]?: boolean;
	[Skill.MAITRE_LEVITATEUR]?: boolean;
	[Item.EMBER]?: boolean;
	[Item.BEER]?: boolean;
}

export const initializeDinoz = (
	team: Team | null,
	teamIndex: number,
	dinoz: DinozToGetFighter,
	place: PlaceEnum,
	bossFight: boolean
) => {
	// Costume
	let costume: MonsterFiche | undefined = undefined;

	// Find items for non clone figther
	const items = dinoz.items.map(item => {
		const itemFiche = Object.values(itemList).find(i => i.itemId === item.itemId);

		if (!itemFiche) {
			throw new Error(`Item ${item.itemId} not found`);
		}

		// Add bamboo monster
		if (team && itemFiche.itemId === Item.BAMBOO_FRIEND) {
			team.monsterList.push({ ...monsterList.BAMBOOZ_SPROUTING });
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

	// Find skills for non clone fighter
	const skills = dinoz.skills.map(skill => {
		const skillDetails = skillList[skill.skillId as Skill];

		if (!skillDetails) {
			throw new Error(`Skill ${skill.skillId} not found`);
		}

		return { ...skillDetails };
	});

	// Statuses
	const dinozStatus = dinoz.status.map(status => status.statusId as DinozStatusId);

	// Ignore CATCHING_GLOVE if this is a boss fight
	if (bossFight && dinozStatus.includes(DinozStatusId.CATCHING_GLOVE)) {
		dinozStatus.splice(dinozStatus.indexOf(DinozStatusId.CATCHING_GLOVE), 1);
	}

	const dinozWithItems = {
		...dinoz,
		items: dinoz.items.map(item => item.itemId)
	};

	const fighter: DetailedFighter = {
		id: dinoz.id,
		display: dinoz.display,
		name: dinoz.name,
		level: dinoz.level,
		type: 'dinoz' as const,
		attacker: teamIndex === 0,
		maxHp: dinoz.maxLife,
		startingHp: dinoz.life,
		hp: dinoz.life,
		energy: 100,
		maxEnergy: 100,
		balanced: true,
		stats: {
			base: {
				[ElementType.AIR]: dinoz.nbrUpAir,
				[ElementType.FIRE]: dinoz.nbrUpFire,
				[ElementType.LIGHTNING]: dinoz.nbrUpLightning,
				[ElementType.WATER]: dinoz.nbrUpWater,
				[ElementType.WOOD]: dinoz.nbrUpWood,
				[ElementType.VOID]: 0
			},
			assaultBonus: {
				[ElementType.AIR]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.AIR).bonus,
				[ElementType.FIRE]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.FIRE).bonus,
				[ElementType.LIGHTNING]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.LIGHTNING).bonus,
				[ElementType.WATER]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.WATER).bonus,
				[ElementType.WOOD]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.WOOD).bonus,
				[ElementType.VOID]: 0
			},
			defense: {
				[ElementType.AIR]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.AIR).value,
				[ElementType.FIRE]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.FIRE).value,
				[ElementType.LIGHTNING]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.LIGHTNING).value,
				[ElementType.WATER]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.WATER).value,
				[ElementType.WOOD]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.WOOD).value,
				[ElementType.VOID]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.NEUTRAL).value
			},
			special: {
				[SpecialStat.INITIATIVE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.INITIATIVE)?.value ?? 0,
				[SpecialStat.ENERGY]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ENERGY)?.value ?? 0,
				[SpecialStat.ENERGY_RECOVERY]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ENERGY_RECOVERY)?.value ?? 0,
				[SpecialStat.ARMOR]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ARMOR)?.value ?? 0,
				[SpecialStat.MULTIHIT]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.MULTIHIT)?.value ?? 0,
				[SpecialStat.EVASION]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.EVASION)?.value ?? 0,
				[SpecialStat.COUNTER]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.COUNTER)?.value ?? 0,
				[SpecialStat.BUBBLE_RATE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.BUBBLE_RATE)?.value ?? 0,
				[SpecialStat.TORCH_DAMAGE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.TORCH_DAMAGE)?.value ?? 0,
				[SpecialStat.ACID_BLOOD_DAMAGE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ACID_BLOOD_DAMAGE)?.value ?? 0
			},
			speed: {
				[ElementType.AIR]: 1,
				[ElementType.FIRE]: 1,
				[ElementType.LIGHTNING]: 1,
				[ElementType.WATER]: 1,
				[ElementType.WOOD]: 1,
				[ElementType.VOID]: 1,
				global: 1
			}
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
			[ElementType.VOID]: 0
		},
		nextAssaultBonus: 0,
		nextAssaultMultiplier: 1,
		costume,
		invocations: 1,
		initiallyCursed: dinoz.status.some(status => status.statusId === DinozStatusId.CURSED),
		permanentStatusGained: []
	};

	handleSkills(team, fighter, place);
	handleDinozStatuses(fighter, dinozStatus);

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
	if (fighter.items.some(item => item.itemId === Item.TEMPORAL_REDUCTION)) {
		// Reduce by 50%
		initiative *= 0.5;
	}

	// Deduct the time from the fighter's initial time
	fighter.time -= initiative * TIME_FACTOR;
	// Add a random amount of time between 0 and 10 to randomize the first fighter
	fighter.time += Math.round(Math.random() * TIME_BASE) * TIME_FACTOR;

	// Energy
	setMaxEnergy(fighter, fighter.stats.special.energy ?? 100);
	fighter.energy = fighter.maxEnergy;

	// Handle elements (from highest to lowest)
	const elements = [
		{ element: ElementType.FIRE, value: fighter.stats.base[ElementType.FIRE] },
		{ element: ElementType.WOOD, value: fighter.stats.base[ElementType.WOOD] },
		{ element: ElementType.WATER, value: fighter.stats.base[ElementType.WATER] },
		{ element: ElementType.LIGHTNING, value: fighter.stats.base[ElementType.LIGHTNING] },
		{ element: ElementType.AIR, value: fighter.stats.base[ElementType.AIR] }
	];

	// Order the elements from highest to lowest, random if equal
	elements.sort((a, b) => {
		if (b.value !== a.value) {
			return b.value - a.value;
		}
		return Math.random() > 0.5 ? 1 : -1;
	});

	// SPECIALISTE
	if (fighter.skills.some(skill => skill.id === Skill.SPECIALISTE)) {
		// Remove the lowest element
		elements.pop();
	}

	fighter.elements = elements.map(element => element.element);
	fighter.element = fighter.elements[0];

	return fighter;
};

export const cloneDinoz = (dinoz: DetailedFighter, fightData: DetailedFight) => {
	const has_tear = dinoz.items.some(item => item.itemId === Item.TEAR_OF_LIFE);
	const clone_id = -1 - fightData.fighters.filter(f => f.type !== 'dinoz').length;

	const clone: DetailedFighter = {
		id: clone_id,
		display: dinoz.display,
		name: dinoz.name,
		level: dinoz.level,
		type: 'clone' as const, // TODO: this may not work well, in case a monster calls a clone, it's still a monster
		attacker: dinoz.attacker,
		maxHp: dinoz.maxHp,
		startingHp: has_tear ? dinoz.maxHp * 0.1 : 1,
		hp: has_tear ? dinoz.maxHp * 0.1 : 1,
		energy: 100, // Default for clone
		maxEnergy: 100, // Default for clone
		balanced: dinoz.balanced,
		stats: {
			base: dinoz.stats.base,
			assaultBonus: dinoz.stats.assaultBonus,
			defense: dinoz.stats.defense,
			special: {
				[SpecialStat.INITIATIVE]: 0, // No initative for clones
				[SpecialStat.ENERGY]: 0, // No energy recovery bonus for clones
				[SpecialStat.ENERGY_RECOVERY]: 0, // No energy recovery bonus for clones
				[SpecialStat.ARMOR]: dinoz.stats.special[SpecialStat.ARMOR],
				[SpecialStat.MULTIHIT]: dinoz.stats.special[SpecialStat.MULTIHIT],
				[SpecialStat.EVASION]: dinoz.stats.special[SpecialStat.EVASION],
				[SpecialStat.COUNTER]: dinoz.stats.special[SpecialStat.COUNTER],
				[SpecialStat.BUBBLE_RATE]: 0, // No bubble for clones
				[SpecialStat.TORCH_DAMAGE]: 0, // No torch for clones
				[SpecialStat.ACID_BLOOD_DAMAGE]: 0 // No acid blood for clones
			},
			speed: dinoz.stats.speed
		},
		items: [], // No items for clones
		itemsUsed: [],
		time: dinoz.time, // Clone start with their summoner's time
		skills: [], // No skills for clones
		status: [], // No statuses for clones
		activeSkills: [],
		elements: dinoz.elements, // Copy exactly the elements of the original dinoz
		element: ElementType.AIR, // Temporary, is changed below
		minDamage: dinoz.minDamage,
		minAssaultDamage: dinoz.minAssaultDamage,
		skillElementalBonus: dinoz.skillElementalBonus,
		nextAssaultBonus: 0, // Not carried over to clone from original dinoz
		nextAssaultMultiplier: 1, // Not carried over to clone from original dinoz
		costume: undefined,
		invocations: 0,
		initiallyCursed: false,
		permanentStatusGained: [],
		// Copy also special passives from original dinoz
		canHitFlying: dinoz.canHitFlying,
		canHitIntangible: dinoz.canHitIntangible,
		cancelArmor: dinoz.cancelArmor
	};

	// Make sure the clone starts with the highest element
	const bestElement = clone.elements.reduce((acc, element) => {
		if (clone.stats.base[element] > clone.stats.base[acc]) {
			return element;
		}

		return acc;
	}, ElementType.FIRE);
	clone.element = bestElement;

	return clone;
};

export const initializeMonster = (
	memory: {
		existingMonsters: number;
		renfortApplied: number;
		wormCalls: number;
	},
	team: Team | null,
	teamIndex: number,
	monster: MonsterFiche,
	place: PlaceEnum
): DetailedFighter => {
	memory.existingMonsters++;

	// Find skills
	const skills =
		monster.skills?.map(skill => {
			const skillDetails = skillList[skill];

			if (!skillDetails) {
				throw new Error(`Skill ${skill} not found`);
			}

			// Reduce probability by 3.5 for each consecutive M_RENFORTS
			let probability = skillDetails.probability ?? 0;

			if (skill === Skill.M_RENFORTS) {
				probability -= 3.5 * memory.renfortApplied;
				memory.renfortApplied++;
			}

			if (skill === Skill.M_WORM_CALL) {
				probability -= 3.5 * memory.renfortApplied;
				memory.wormCalls++;
			}

			if (probability < 0) {
				probability = 0;
			}

			return {
				...skillDetails,
				probability
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
		items: []
	};

	const fighter: DetailedFighter = {
		id: -memory.existingMonsters,
		display: monster.display ?? '',
		name: monster.name,
		level: monster.level,
		type: 'monster' as const,
		attacker: teamIndex === 0,
		maxHp: monster.hp,
		startingHp: monster.hp,
		hp: monster.hp,
		energy: 100,
		maxEnergy: 100,
		balanced: monster.balanced,
		stats: {
			base: {
				[ElementType.AIR]: monster.elements.air,
				[ElementType.FIRE]: monster.elements.fire,
				[ElementType.LIGHTNING]: monster.elements.lightning,
				[ElementType.WATER]: monster.elements.water,
				[ElementType.WOOD]: monster.elements.wood,
				[ElementType.VOID]: 0
			},
			assaultBonus: {
				[ElementType.AIR]:
					getAssaultStat(similiDinoz, [], skills, AssaultElement.AIR).bonus + (monster.bonus_attack ?? 0),
				[ElementType.FIRE]:
					getAssaultStat(similiDinoz, [], skills, AssaultElement.FIRE).bonus + (monster.bonus_attack ?? 0),
				[ElementType.LIGHTNING]:
					getAssaultStat(similiDinoz, [], skills, AssaultElement.LIGHTNING).bonus + (monster.bonus_attack ?? 0),
				[ElementType.WATER]:
					getAssaultStat(similiDinoz, [], skills, AssaultElement.WATER).bonus + (monster.bonus_attack ?? 0),
				[ElementType.WOOD]:
					getAssaultStat(similiDinoz, [], skills, AssaultElement.WOOD).bonus + (monster.bonus_attack ?? 0),
				[ElementType.VOID]: 0
			},
			defense: {
				[ElementType.AIR]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.AIR).value + (monster.bonus_defense ?? 0),
				[ElementType.FIRE]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.FIRE).value + (monster.bonus_defense ?? 0),
				[ElementType.LIGHTNING]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.LIGHTNING).value + (monster.bonus_defense ?? 0),
				[ElementType.WATER]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.WATER).value + (monster.bonus_defense ?? 0),
				[ElementType.WOOD]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.WOOD).value + (monster.bonus_defense ?? 0),
				[ElementType.VOID]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.NEUTRAL).value + (monster.bonus_defense ?? 0)
			},
			special: {
				[SpecialStat.INITIATIVE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.INITIATIVE)?.value ?? 0,
				[SpecialStat.ENERGY]: getSpecialStat(similiDinoz, [], skills, SpecialStat.ENERGY)?.value ?? 0,
				[SpecialStat.ENERGY_RECOVERY]: getSpecialStat(similiDinoz, [], skills, SpecialStat.ENERGY_RECOVERY)?.value ?? 0,
				[SpecialStat.ARMOR]: getSpecialStat(similiDinoz, [], skills, SpecialStat.ARMOR)?.value ?? 0,
				[SpecialStat.MULTIHIT]: getSpecialStat(similiDinoz, [], skills, SpecialStat.MULTIHIT)?.value ?? 0,
				[SpecialStat.EVASION]: getSpecialStat(similiDinoz, [], skills, SpecialStat.EVASION)?.value ?? 0,
				[SpecialStat.COUNTER]: getSpecialStat(similiDinoz, [], skills, SpecialStat.COUNTER)?.value ?? 0,
				[SpecialStat.BUBBLE_RATE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.BUBBLE_RATE)?.value ?? 0,
				[SpecialStat.TORCH_DAMAGE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.TORCH_DAMAGE)?.value ?? 0,
				[SpecialStat.ACID_BLOOD_DAMAGE]:
					getSpecialStat(similiDinoz, [], skills, SpecialStat.ACID_BLOOD_DAMAGE)?.value ?? 0
			},
			speed: {
				[ElementType.AIR]: 1,
				[ElementType.FIRE]: 1,
				[ElementType.LIGHTNING]: 1,
				[ElementType.WATER]: 1,
				[ElementType.WOOD]: 1,
				[ElementType.VOID]: 1,
				global: 1
			}
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
			ElementType.VOID
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
			[ElementType.VOID]: 0
		},
		nextAssaultBonus: 0,
		nextAssaultMultiplier: 1,
		invocations: 0,
		initiallyCursed: false,
		permanentStatusGained: []
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
		{ element: ElementType.VOID, value: fighter.stats.base[ElementType.VOID] }
	];

	// Order the elements from highest to lowest, random if equal
	elements.sort((a, b) => {
		if (b.value !== a.value) {
			return b.value - a.value;
		}
		return Math.random() > 0.5 ? 1 : -1;
	});

	// Filter out elements with 0 value
	fighter.elements = elements.filter(element => element.value > 0).map(element => element.element);

	if (fighter.elements.length === 0) {
		fighter.elements = [ElementType.VOID];
	}

	// SPECIALISTE
	if (fighter.skills.some(skill => skill.id === Skill.SPECIALISTE)) {
		// Remove the lowest element
		if (fighter.elements.length > 1) {
			elements.pop();
		}
	}

	fighter.element = fighter.elements[0];

	return fighter;
};

const handleDinozStatuses = (fighter: DetailedFighter, statuses: DinozStatusId[]) => {
	const fighterHas = statuses.reduce(
		(acc, status) => {
			acc[status] = true;
			return acc;
		},
		{} as Record<DinozStatusId, boolean>
	);

	if (fighterHas[DinozStatusId.CUSCOUZ_MALEDICTION]) {
		fighter.costume = monsterList.FRUTOX_DEFENDER;
	}

	if (fighterHas[DinozStatusId.CATCHING_GLOVE]) {
		fighter.skills.push({ ...skillList[Skill.CATCH] });
	}
};

const handleSkills = (team: Team | null, fighter: DetailedFighter, place: PlaceEnum) => {
	const fighterHas = fighter.skills.reduce(
		(acc, skill) => {
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
		},
		{} as Record<Skill, boolean>
	);

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

	if (fighterHas[Skill.SAPEUR]) {
		// Increase item use probability by 50%
		fighter.items.forEach(item => {
			item.probability = (item.probability ?? 0) * 1.5;
		});
	}

	// AIR
	if (fighterHas[Skill.SAUT]) {
		fighter.canHitFlying = true;
	}

	if (team && fighterHas[Skill.MAITRE_LEVITATEUR]) {
		team[Skill.MAITRE_LEVITATEUR] = true;
	}

	if (fighterHas[Skill.SOUFFLE_DE_VIE]) {
		fighter.status.push(createStatus(Status.NO_POISON));
		fighter.status.push(createStatus(Status.NO_CURSE));
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

	if (fighterHas[Skill.FORCE_DE_LUMIERE]) {
		// +30 assault damage if on DARKWORLD
		if (PlacesByMap[MapZone.DARKWORLD]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 30;
			fighter.stats.assaultBonus[ElementType.FIRE] += 30;
			fighter.stats.assaultBonus[ElementType.WOOD] += 30;
			fighter.stats.assaultBonus[ElementType.WATER] += 30;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 30;
		}
	}

	if (fighterHas[Skill.ORIGINE_CAUSHEMESHENNE]) {
		// +30 assault damage if on CAUSHEMESH
		if (PlacesByMap[MapZone.CAUSHEMESH]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 30;
			fighter.stats.assaultBonus[ElementType.FIRE] += 30;
			fighter.stats.assaultBonus[ElementType.WOOD] += 30;
			fighter.stats.assaultBonus[ElementType.WATER] += 30;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 30;
		}
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
		wormCalls: 0
	};

	const bossFight = team2.monsterList.some(monster => monster.boss);

	[team1, team2].forEach((team, index) => {
		const { dinozList, monsterList: monsters } = team;

		// Dinoz
		fighters.push(
			...dinozList.map(dinoz => {
				const fighter = initializeDinoz(team, index, dinoz, place, bossFight);

				// Catches
				for (let i = 0; i < dinoz.catches.length; i++) {
					// Limit to 3 catches
					if (i > 2) break;

					const dinozCatch = dinoz.catches[i];
					const probabilities = [3, 1, 1, 1];
					const catchSkill = fighter.skills.find(skill => skill.id === Skill.CATCH);

					if (!catchSkill) {
						throw new Error(`Dinoz ${dinoz.id} has no catch skill`);
					}

					// Adjust catch probability
					catchSkill.probability = probabilities[i];

					const monster = initializeMonster(
						memory,
						team,
						index,
						{ ...monsterList[dinozCatch.monsterId as Monster] },
						place
					);
					monster.startingHp = dinozCatch.hp;
					monster.hp = dinozCatch.hp;
					monster.catcher = dinoz.id;
					monster.catchId = dinozCatch.id;

					// Add monster
					fighters.push(monster);
				}

				return fighter;
			})
		);

		// Monsters
		fighters.push(...monsters.map(monster => initializeMonster(memory, team, index, monster, place)));
	});

	// Handle team wide modifiers
	fighters.forEach(fighter => {
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
		// AIR
		if (team[Skill.MAITRE_LEVITATEUR]) {
			fighter.canHitFlying = true;
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
