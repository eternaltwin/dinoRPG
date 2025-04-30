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
import { BaseSpecialStats, SpecialStat, getSpecialStat } from '@drpg/core/utils/getSpecialStat';
import { DinozToGetFighter } from '@drpg/core/models/fight/FightConfiguration';
import { TIME_BASE, TIME_FACTOR } from '@drpg/core/utils/fightConstants';
import { createStatus, setMaxEnergy } from './fightMethods.js';
import { getAssaultValue } from './getDamage.js';
import { MonsterBonus } from './monsterBonuses.js';
import { DetailedFight } from './generateFight.js';
import { randomBetweenSeeded } from './randomBetween.js';
import seedrandom from 'seedrandom';

interface Team {
	dinozList: DinozToGetFighter[];
	monsterList: MonsterFiche[];
	[Skill.ELECTROLYSE]: number;
	[Skill.GARDE_FORESTIER]: number;
	[Skill.CHEF_DE_GUERRE]?: boolean;
	[Skill.MAITRE_LEVITATEUR]?: boolean;
	[Item.EMBER]?: boolean;
	[Item.BEER]?: boolean;
}

export const initializeDinoz = (
	team: Team | null,
	teamIndex: number,
	dinoz: DinozToGetFighter,
	place: PlaceEnum,
	bossFight: boolean,
	random: seedrandom.PRNG
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
			// TODO: fix and use the right methods or do it somewhere else as it may be missed
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

	const hasWarLord = (team && team[Skill.CHEF_DE_GUERRE]) ? true : false;

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
		comboCounter: 0,
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
				[ElementType.AIR]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.AIR, hasWarLord).bonus,
				[ElementType.FIRE]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.FIRE, hasWarLord).bonus,
				[ElementType.LIGHTNING]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.LIGHTNING, hasWarLord).bonus,
				[ElementType.WATER]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.WATER, hasWarLord).bonus,
				[ElementType.WOOD]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.WOOD, hasWarLord).bonus,
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
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.INITIATIVE)?.value ?? BaseSpecialStats[SpecialStat.INITIATIVE],
				[SpecialStat.ENERGY]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ENERGY)?.value ?? BaseSpecialStats[SpecialStat.ENERGY],
				[SpecialStat.ENERGY_RECOVERY]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ENERGY_RECOVERY)?.value ?? BaseSpecialStats[SpecialStat.ENERGY_RECOVERY],
				[SpecialStat.BUBBLE_RATE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.BUBBLE_RATE)?.value ?? BaseSpecialStats[SpecialStat.BUBBLE_RATE],
				[SpecialStat.TORCH_DAMAGE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.TORCH_DAMAGE)?.value ?? BaseSpecialStats[SpecialStat.TORCH_DAMAGE],
				[SpecialStat.ACID_BLOOD_DAMAGE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ACID_BLOOD_DAMAGE)?.value ?? BaseSpecialStats[SpecialStat.ACID_BLOOD_DAMAGE],
			},
			counter: {
				global: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.COUNTER)?.value ?? BaseSpecialStats[SpecialStat.COUNTER],
				[ElementType.FIRE]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.FIRE_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.FIRE_COUNTER],
				[ElementType.WOOD]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WOOD_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.WOOD_COUNTER],
				[ElementType.WATER]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WATER_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.WATER_COUNTER],
				[ElementType.LIGHTNING]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.LIGHTNING_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_COUNTER],
				[ElementType.AIR]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.AIR_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.AIR_COUNTER],
				[ElementType.VOID]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.VOID_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.VOID_COUNTER],
			},
			armor: {
				global: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ARMOR)?.value ?? BaseSpecialStats[SpecialStat.ARMOR],
				[ElementType.FIRE]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.FIRE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.FIRE_ARMOR],
				[ElementType.WOOD]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WOOD_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.WOOD_ARMOR],
				[ElementType.WATER]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WATER_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.WATER_ARMOR],
				[ElementType.LIGHTNING]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.LIGHTNING_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_ARMOR],
				[ElementType.AIR]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.AIR_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.AIR_ARMOR],
				[ElementType.VOID]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.VOID_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.VOID_ARMOR],
			},
			ignoreArmor: {
				global: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.IGNORE_ARMOR],
				assault: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ASSAULT_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.ASSAULT_IGNORE_ARMOR],
				[ElementType.FIRE]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.FIRE_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.FIRE_IGNORE_ARMOR],
				[ElementType.WOOD]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WOOD_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.WOOD_IGNORE_ARMOR],
				[ElementType.WATER]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WATER_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.WATER_IGNORE_ARMOR],
				[ElementType.LIGHTNING]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.LIGHTNING_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_IGNORE_ARMOR],
				[ElementType.AIR]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.AIR_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.AIR_IGNORE_ARMOR],
				[ElementType.VOID]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.VOID_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.VOID_IGNORE_ARMOR],
			},
			evasion: {
				global: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.EVASION)?.value ?? BaseSpecialStats[SpecialStat.EVASION],
				[ElementType.FIRE]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.FIRE_EVASION)?.value ?? BaseSpecialStats[SpecialStat.FIRE_EVASION],
				[ElementType.WOOD]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WOOD_EVASION)?.value ?? BaseSpecialStats[SpecialStat.WOOD_EVASION],
				[ElementType.WATER]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WATER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.WATER_EVASION],
				[ElementType.LIGHTNING]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.LIGHTNING_EVASION)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_EVASION],
				[ElementType.AIR]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.AIR_EVASION)?.value ?? BaseSpecialStats[SpecialStat.AIR_EVASION],
				[ElementType.VOID]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.VOID_EVASION)?.value ?? BaseSpecialStats[SpecialStat.VOID_EVASION],
			},
			superEvasion: {
				global: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.SUPER_EVASION],
				[ElementType.FIRE]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.FIRE_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.FIRE_SUPER_EVASION],
				[ElementType.WOOD]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WOOD_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.WOOD_SUPER_EVASION],
				[ElementType.WATER]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WATER_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.WATER_SUPER_EVASION],
				[ElementType.LIGHTNING]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.LIGHTNING_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_SUPER_EVASION],
				[ElementType.AIR]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.AIR_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.AIR_SUPER_EVASION],
				[ElementType.VOID]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.VOID_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.VOID_SUPER_EVASION],
			},
			multihit: {
				global: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.MULTIHIT],
				[ElementType.FIRE]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.FIRE_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.FIRE_MULTIHIT],
				[ElementType.WOOD]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WOOD_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.WOOD_MULTIHIT],
				[ElementType.WATER]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WATER_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.WATER_MULTIHIT],
				[ElementType.LIGHTNING]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.LIGHTNING_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_MULTIHIT],
				[ElementType.AIR]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.AIR_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.AIR_MULTIHIT],
				[ElementType.VOID]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.VOID_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.VOID_MULTIHIT],
			},
			speed: {
				global: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.SPEED)?.value ?? BaseSpecialStats[SpecialStat.SPEED],
				[ElementType.FIRE]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.FIRE_SPEED)?.value ?? BaseSpecialStats[SpecialStat.FIRE_SPEED],
				[ElementType.WOOD]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WOOD_SPEED)?.value ?? BaseSpecialStats[SpecialStat.WOOD_SPEED],
				[ElementType.WATER]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.WATER_SPEED)?.value ?? BaseSpecialStats[SpecialStat.WATER_SPEED],
				[ElementType.LIGHTNING]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.LIGHTNING_SPEED)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_SPEED],
				[ElementType.AIR]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.AIR_SPEED)?.value ?? BaseSpecialStats[SpecialStat.AIR_SPEED],
				[ElementType.VOID]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.VOID_SPEED)?.value ?? BaseSpecialStats[SpecialStat.VOID_SPEED],
			},
		},
		items,
		itemsUsed: [],
		time: 0,
		skills,
		status: [],
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
		allAssaultMultiplier: 1,
		nextAssaultBonus: 0,
		nextAssaultMultiplier: 1,
		costume,
		invocations: 1,
		initiallyCursed: dinoz.status.some(status => status.statusId === DinozStatusId.CURSED),
		permanentStatusGained: [],
		perception: false,
		canHitFlying: false,
		canHitIntangible: false,
		cancelArmor: false,
		cancelAssaultDodge: false,
		hasRock: false,
		hasUsedHypnose: false,
		hasUsedHyperventilation: false,
		hasRaged: false
	};

	handleSkills(random, team, fighter, place);
	handleDinozStatuses(fighter, dinozStatus);

	// Order skills by priority, random if equal
	fighter.skills.sort((a, b) => {
		const aPriority = a.priority ?? 0;
		const bPriority = b.priority ?? 0;

		if (aPriority !== bPriority) {
			return bPriority - aPriority;
		}

		return random() > 0.5 ? 1 : -1;
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
	fighter.time += Math.round(random() * TIME_BASE) * TIME_FACTOR;

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
		return random() > 0.5 ? 1 : -1;
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
		comboCounter: 0,
		stats: {
			base: dinoz.stats.base,
			assaultBonus: dinoz.stats.assaultBonus,
			defense: dinoz.stats.defense,
			special: {
				[SpecialStat.INITIATIVE]: 0, // No initative for clones
				[SpecialStat.ENERGY]: 0, // No energy recovery bonus for clones
				[SpecialStat.ENERGY_RECOVERY]: 0, // No energy recovery bonus for clones
				[SpecialStat.BUBBLE_RATE]: 0, // No bubble for clones
				[SpecialStat.TORCH_DAMAGE]: 0, // No torch for clones
				[SpecialStat.ACID_BLOOD_DAMAGE]: 0 // No acid blood for clones
			},
			armor: dinoz.stats.armor,
			ignoreArmor: dinoz.stats.ignoreArmor,
			speed: dinoz.stats.speed,
			multihit: dinoz.stats.multihit,
			counter: dinoz.stats.counter,
			evasion: dinoz.stats.evasion,
			superEvasion: dinoz.stats.evasion
		},
		items: [], // No items for clones
		itemsUsed: [],
		time: dinoz.time, // Clone start with their summoner's time
		skills: [], // No skills for clones
		status: [], // No statuses for clones
		elements: [], // Copy exactly the elements of the original dinoz, see below
		element: ElementType.AIR, // Temporary, is changed below
		minDamage: dinoz.minDamage,
		minAssaultDamage: dinoz.minAssaultDamage,
		skillElementalBonus: dinoz.skillElementalBonus,
		allAssaultMultiplier: 1, // Not carried over to clone from original dinoz
		nextAssaultBonus: 0, // Not carried over to clone from original dinoz
		nextAssaultMultiplier: 1, // Not carried over to clone from original dinoz
		costume: undefined,
		invocations: 0,
		initiallyCursed: false,
		permanentStatusGained: [],
		// Copy also special passives from original dinoz
		perception: dinoz.perception,
		canHitFlying: dinoz.canHitFlying,
		canHitIntangible: dinoz.canHitIntangible,
		cancelArmor: dinoz.cancelArmor,
		hasRock: dinoz.hasRock,
		// Cancel dodge is not copied
		cancelAssaultDodge: false,
		hasUsedHypnose: false,
		hasUsedHyperventilation: false,
		hasRaged: false
	};

	// Redo the element ordering because the original dinoz may have altered elements
	// Handle elements (from highest to lowest)
	const elements = [
		{ element: ElementType.FIRE, value: clone.stats.base[ElementType.FIRE] },
		{ element: ElementType.WOOD, value: clone.stats.base[ElementType.WOOD] },
		{ element: ElementType.WATER, value: clone.stats.base[ElementType.WATER] },
		{ element: ElementType.LIGHTNING, value: clone.stats.base[ElementType.LIGHTNING] },
		{ element: ElementType.AIR, value: clone.stats.base[ElementType.AIR] }
	];

	// Order the elements from highest to lowest, random if equal
	elements.sort((a, b) => {
		if (b.value !== a.value) {
			return b.value - a.value;
		}
		return fightData.rng() > 0.5 ? 1 : -1;
	});
	clone.elements = elements.map(element => element.element);
	clone.element = clone.elements[0];

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
	place: PlaceEnum,
	is_reinforcement: boolean,
	random: seedrandom.PRNG
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
		type: is_reinforcement ? 'reinforcement' : monster.boss ? 'boss' : ('monster' as const),
		attacker: teamIndex === 0,
		maxHp: monster.hp,
		startingHp: monster.hp,
		hp: monster.hp,
		energy: 100,
		maxEnergy: 100,
		balanced: monster.balanced,
		comboCounter: 0,
		stats: {
			base: {
				[ElementType.AIR]: monster.elements.air,
				[ElementType.FIRE]: monster.elements.fire,
				[ElementType.LIGHTNING]: monster.elements.lightning,
				[ElementType.WATER]: monster.elements.water,
				[ElementType.WOOD]: monster.elements.wood,
				[ElementType.VOID]: monster.bonus_attack ?? 0
			},
			assaultBonus: {
				[ElementType.AIR]: getAssaultStat(similiDinoz, [], skills, AssaultElement.AIR).bonus,
				[ElementType.FIRE]: getAssaultStat(similiDinoz, [], skills, AssaultElement.FIRE).bonus,
				[ElementType.LIGHTNING]: getAssaultStat(similiDinoz, [], skills, AssaultElement.LIGHTNING).bonus,
				[ElementType.WATER]: getAssaultStat(similiDinoz, [], skills, AssaultElement.WATER).bonus,
				[ElementType.WOOD]: getAssaultStat(similiDinoz, [], skills, AssaultElement.WOOD).bonus,
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
				[SpecialStat.INITIATIVE]:
					getSpecialStat(similiDinoz, [], skills, SpecialStat.INITIATIVE)?.value ?? BaseSpecialStats[SpecialStat.INITIATIVE],
				[SpecialStat.ENERGY]: getSpecialStat(similiDinoz, [], skills, SpecialStat.ENERGY)?.value ?? BaseSpecialStats[SpecialStat.ENERGY],
				[SpecialStat.ENERGY_RECOVERY]:
					getSpecialStat(similiDinoz, [], skills, SpecialStat.ENERGY_RECOVERY)?.value ?? BaseSpecialStats[SpecialStat.ENERGY_RECOVERY],
				[SpecialStat.BUBBLE_RATE]:
					getSpecialStat(similiDinoz, [], skills, SpecialStat.BUBBLE_RATE)?.value ?? BaseSpecialStats[SpecialStat.BUBBLE_RATE],
				[SpecialStat.TORCH_DAMAGE]:
					getSpecialStat(similiDinoz, [], skills, SpecialStat.TORCH_DAMAGE)?.value ?? BaseSpecialStats[SpecialStat.TORCH_DAMAGE],
				[SpecialStat.ACID_BLOOD_DAMAGE]:
					getSpecialStat(similiDinoz, [], skills, SpecialStat.ACID_BLOOD_DAMAGE)?.value ?? BaseSpecialStats[SpecialStat.ACID_BLOOD_DAMAGE],
			},
			counter: {
				global: getSpecialStat(similiDinoz, [], skills, SpecialStat.COUNTER)?.value ?? BaseSpecialStats[SpecialStat.COUNTER],
				[ElementType.FIRE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.FIRE_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.FIRE_COUNTER],
				[ElementType.WOOD]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WOOD_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.WOOD_COUNTER],
				[ElementType.WATER]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WATER_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.WATER_COUNTER],
				[ElementType.LIGHTNING]: getSpecialStat(similiDinoz, [], skills, SpecialStat.LIGHTNING_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_COUNTER],
				[ElementType.AIR]: getSpecialStat(similiDinoz, [], skills, SpecialStat.AIR_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.AIR_COUNTER],
				[ElementType.VOID]: getSpecialStat(similiDinoz, [], skills, SpecialStat.VOID_COUNTER)?.value ?? BaseSpecialStats[SpecialStat.VOID_COUNTER],
			},
			armor: {
				global: getSpecialStat(similiDinoz, [], skills, SpecialStat.ARMOR)?.value ?? BaseSpecialStats[SpecialStat.ARMOR],
				[ElementType.FIRE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.FIRE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.FIRE_ARMOR],
				[ElementType.WOOD]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WOOD_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.WOOD_ARMOR],
				[ElementType.WATER]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WATER_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.WATER_ARMOR],
				[ElementType.LIGHTNING]: getSpecialStat(similiDinoz, [], skills, SpecialStat.LIGHTNING_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_ARMOR],
				[ElementType.AIR]: getSpecialStat(similiDinoz, [], skills, SpecialStat.AIR_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.AIR_ARMOR],
				[ElementType.VOID]: getSpecialStat(similiDinoz, [], skills, SpecialStat.VOID_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.VOID_ARMOR],
			},
			ignoreArmor: {
				global: getSpecialStat(similiDinoz, [], skills, SpecialStat.IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.IGNORE_ARMOR],
				assault: getSpecialStat(similiDinoz, [], skills, SpecialStat.ASSAULT_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.ASSAULT_IGNORE_ARMOR],
				[ElementType.FIRE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.FIRE_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.FIRE_IGNORE_ARMOR],
				[ElementType.WOOD]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WOOD_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.WOOD_IGNORE_ARMOR],
				[ElementType.WATER]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WATER_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.WATER_IGNORE_ARMOR],
				[ElementType.LIGHTNING]: getSpecialStat(similiDinoz, [], skills, SpecialStat.LIGHTNING_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_IGNORE_ARMOR],
				[ElementType.AIR]: getSpecialStat(similiDinoz, [], skills, SpecialStat.AIR_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.AIR_IGNORE_ARMOR],
				[ElementType.VOID]: getSpecialStat(similiDinoz, [], skills, SpecialStat.VOID_IGNORE_ARMOR)?.value ?? BaseSpecialStats[SpecialStat.VOID_IGNORE_ARMOR],
			},
			evasion: {
				global: getSpecialStat(similiDinoz, [], skills, SpecialStat.EVASION)?.value ?? BaseSpecialStats[SpecialStat.EVASION],
				[ElementType.FIRE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.FIRE_EVASION)?.value ?? BaseSpecialStats[SpecialStat.FIRE_EVASION],
				[ElementType.WOOD]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WOOD_EVASION)?.value ?? BaseSpecialStats[SpecialStat.WOOD_EVASION],
				[ElementType.WATER]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WATER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.WATER_EVASION],
				[ElementType.LIGHTNING]: getSpecialStat(similiDinoz, [], skills, SpecialStat.LIGHTNING_EVASION)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_EVASION],
				[ElementType.AIR]: getSpecialStat(similiDinoz, [], skills, SpecialStat.AIR_EVASION)?.value ?? BaseSpecialStats[SpecialStat.AIR_EVASION],
				[ElementType.VOID]: getSpecialStat(similiDinoz, [], skills, SpecialStat.VOID_EVASION)?.value ?? BaseSpecialStats[SpecialStat.VOID_EVASION],
			},
			superEvasion: {
				global: getSpecialStat(similiDinoz, [], skills, SpecialStat.SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.SUPER_EVASION],
				[ElementType.FIRE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.FIRE_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.FIRE_SUPER_EVASION],
				[ElementType.WOOD]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WOOD_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.WOOD_SUPER_EVASION],
				[ElementType.WATER]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WATER_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.WATER_SUPER_EVASION],
				[ElementType.LIGHTNING]: getSpecialStat(similiDinoz, [], skills, SpecialStat.LIGHTNING_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_SUPER_EVASION],
				[ElementType.AIR]: getSpecialStat(similiDinoz, [], skills, SpecialStat.AIR_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.AIR_SUPER_EVASION],
				[ElementType.VOID]: getSpecialStat(similiDinoz, [], skills, SpecialStat.VOID_SUPER_EVASION)?.value ?? BaseSpecialStats[SpecialStat.VOID_SUPER_EVASION],
			},
			multihit: {
				global: getSpecialStat(similiDinoz, [], skills, SpecialStat.MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.MULTIHIT],
				[ElementType.FIRE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.FIRE_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.FIRE_MULTIHIT],
				[ElementType.WOOD]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WOOD_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.WOOD_MULTIHIT],
				[ElementType.WATER]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WATER_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.WATER_MULTIHIT],
				[ElementType.LIGHTNING]: getSpecialStat(similiDinoz, [], skills, SpecialStat.LIGHTNING_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_MULTIHIT],
				[ElementType.AIR]: getSpecialStat(similiDinoz, [], skills, SpecialStat.AIR_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.AIR_MULTIHIT],
				[ElementType.VOID]: getSpecialStat(similiDinoz, [], skills, SpecialStat.VOID_MULTIHIT)?.value ?? BaseSpecialStats[SpecialStat.VOID_MULTIHIT],
			},
			speed: {
				global: getSpecialStat(similiDinoz, [], skills, SpecialStat.SPEED)?.value ?? BaseSpecialStats[SpecialStat.SPEED],
				[ElementType.FIRE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.FIRE_SPEED)?.value ?? BaseSpecialStats[SpecialStat.FIRE_SPEED],
				[ElementType.WOOD]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WOOD_SPEED)?.value ?? BaseSpecialStats[SpecialStat.WOOD_SPEED],
				[ElementType.WATER]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WATER_SPEED)?.value ?? BaseSpecialStats[SpecialStat.WATER_SPEED],
				[ElementType.LIGHTNING]: getSpecialStat(similiDinoz, [], skills, SpecialStat.LIGHTNING_SPEED)?.value ?? BaseSpecialStats[SpecialStat.LIGHTNING_SPEED],
				[ElementType.AIR]: getSpecialStat(similiDinoz, [], skills, SpecialStat.AIR_SPEED)?.value ?? BaseSpecialStats[SpecialStat.AIR_SPEED],
				[ElementType.VOID]: getSpecialStat(similiDinoz, [], skills, SpecialStat.VOID_SPEED)?.value ?? BaseSpecialStats[SpecialStat.VOID_SPEED],
			},
		},
		items: [],
		itemsUsed: [],
		// Add a random amount of time between 0 and 10 to randomize the first fighter
		time: Math.round(random() * TIME_BASE) * TIME_FACTOR,
		skills,
		status,
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
		allAssaultMultiplier: 1,
		nextAssaultBonus: 0,
		nextAssaultMultiplier: 1,
		invocations: 0,
		initiallyCursed: false,
		permanentStatusGained: [],
		perception: false,
		canHitFlying: false,
		canHitIntangible: false,
		cancelArmor: false,
		cancelAssaultDodge: false,
		hasRock: false,
		hasUsedHypnose: false,
		hasUsedHyperventilation: false,
		hasRaged: false
	};

	// Order skills by priority, random if equal
	fighter.skills.sort((a, b) => {
		const aPriority = a.priority ?? 0;
		const bPriority = b.priority ?? 0;

		if (aPriority !== bPriority) {
			return bPriority - aPriority;
		}

		return random() > 0.5 ? 1 : -1;
	});

	// Time
	let initiative = fighter.stats.special.initiative;

	// Deduct the time from the fighter's initial time
	fighter.time -= initiative * TIME_FACTOR;
	// Add a random amount of time between 0 and 10 to randomize the first fighter
	fighter.time += Math.round(random() * TIME_BASE) * TIME_FACTOR;

	// Energy
	setMaxEnergy(fighter, fighter.stats.special.energy ?? 100);
	fighter.energy = fighter.maxEnergy;

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
		return random() > 0.5 ? 1 : -1;
	});

	// Filter out elements with 0 value
	fighter.elements = elements.filter(element => element.value > 0).map(element => element.element);

	if (fighter.elements.length === 0) {
		fighter.elements = [ElementType.VOID];
	}

	// Handle bonuses after the elements have been handled
	const handleMonsterBonuses = MonsterBonus[monster.id];

	if (handleMonsterBonuses) {
		handleMonsterBonuses(fighter);
	}

	// Skills only after the elements have been handled
	handleSkills(random, team, fighter, place);

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

const handleSkills = (random: seedrandom.PRNG, team: Team | null, fighter: DetailedFighter, place: PlaceEnum) => {
	const fighterHas = fighter.skills.reduce(
		(acc, skill) => {
			acc[skill.id as Skill] = true;
			return acc;
		},
		{} as Record<Skill, boolean>
	);

	// FIRE
	if (fighterHas[Skill.BELIER]) {
		fighter.nextAssaultBonus += 20;
	}

	// WOOD
	if (fighterHas[Skill.TENACITE]) {
		fighter.minDamage += 1;
	}

	if (team && fighterHas[Skill.GARDE_FORESTIER]) {
		team[Skill.GARDE_FORESTIER] += 1;
	}

	if (fighterHas[Skill.FORCE_CONTROL]) {
		if (fighter.minAssaultDamage < 10) {
			fighter.minAssaultDamage = 10;
		}
	}

	// WATER
	if (fighterHas[Skill.PERCEPTION]) {
		fighter.perception = true;
	}

	if (fighterHas[Skill.KARATE_SOUS_MARIN]) {
		fighter.skillElementalBonus[ElementType.WATER] += 10;
	}

	if (fighterHas[Skill.SAPEUR]) {
		// Increase item use probability by 50%
		fighter.items.forEach(item => {
			let probability = (item.probability ?? 0) * 1.5;
			if (probability > 100) {
				probability = 100;
			}
			item.probability = probability;
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

	// Race
	if (fighterHas[Skill.ROCK]) {
		fighter.hasRock = true;
	}

	// 50% chance to get positive / negative time
	if (fighterHas[Skill.DOUBLE_FACE]) {
		fighter.time += (random() > 0.5 ? TIME_BASE : -TIME_BASE) * TIME_FACTOR;
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
		team[Skill.ELECTROLYSE] += 1;
	}

	// SPHERE
	if (fighterHas[Skill.SURVIE]) {
		fighter.canSurvive = true;
	}

	// MONSTER
	if (fighterHas[Skill.M_TOWER_GUARDIAN]) {
		fighter.stats.base[ElementType.FIRE] = 10;
		fighter.stats.base[ElementType.WOOD] = 10;
		fighter.stats.base[ElementType.WATER] = 10;
		fighter.stats.base[ElementType.LIGHTNING] = 10;
		fighter.stats.base[ElementType.AIR] = 10;
		fighter.stats.base[ElementType.VOID] = 10;
		fighter.canHitFlying = true;
		fighter.canHitIntangible = true;
		const randomElement = randomBetweenSeeded(random, 1, 6) as ElementType;
		// Lock to a single element
		fighter.elements = [randomElement];
		fighter.element = randomElement;
	}

	// TODO: handle other skills
};

// Applies a bonus of a given element to all defenses of the fighter, except void
// The defense in the first "weak" element gains 0.5 of the bonus
// The defense in the second "weak" element gains 0.5 of the bonus
// The defense of the element itself, gains the bonus
// The defense in the first "strong" element, gains 1.5 of the bonus
// The defense in the second "strong" element, gains 1.5 of the bonus
// In other words, here we look at what is the contribution of element X to element Y. It is given by the matrix:
// Row is element of the bonus \ Column is impact on the other elements
//           \  Fire  |  Wood  |  Water  | Lightning |  Air
// Fire      |    1   |  1.5   |   1.5   |     0.5   |  0.5
// Wood      |   0.5  |    1   |   1.5   |     1.5   |  0.5
// Water     |   0.5  |  0.5   |     1   |     1.5   |  1.5
// Lightning |   1.5  |  0.5   |   0.5   |       1   |  1.5
// Air       |   1.5  |  1.5   |   0.5   |     0.5   |    1
// For example: a bonus of 2 in Air will propagate to the all the elements as follows by looking at the Air row:
// 2 * 1.5 in Fire and Wood, 2 * 0.5 in Water and Lightning and 2 * 1 in Air
// Vocabulary-wise, this can be said as Air is strong against Fire and Wood as it provides the most defense against those elements
// and weak against water and lightning as the provides the least defense against those elements
// The "wheel" is: an element is strong against the next 2 and weak against the previous 2
// Fire -> Wood -> Water
// ^                |
// |                v
// Air    <-    Lightning
export const applyGlobalDefenseBonus = (fighter: DetailedFighter, element: ElementType, bonus: number) => {
	const elementWheel: ElementType[] = [
		ElementType.FIRE,
		ElementType.WOOD,
		ElementType.WATER,
		ElementType.LIGHTNING,
		ElementType.AIR
	] as const;

	if (element === ElementType.VOID) {
		throw new Error(`Cannot process global defense bonus of void`);
	}

	// The defense of the element itself increases by the bonus
	fighter.stats.defense[element] += bonus;
	// The defense in the first next element increases by 1.5 of the bonus, this is the first "strong" element
	fighter.stats.defense[elementWheel[(elementWheel.indexOf(element) + 1) % elementWheel.length]] += 1.5 * bonus;
	// The defense in the second next element increases by 1.5 of the bonus, this is the second "strong" element
	fighter.stats.defense[elementWheel[(elementWheel.indexOf(element) + 2) % elementWheel.length]] += 1.5 * bonus;
	// The defense in the third element increases by 0.5 of the bonus, this is the first "weak" element
	fighter.stats.defense[elementWheel[(elementWheel.indexOf(element) + 3) % elementWheel.length]] += 0.5 * bonus;
	// The defense in the fourth element increases by 0.5 of the bonus, this is the second "weak" element
	fighter.stats.defense[elementWheel[(elementWheel.indexOf(element) + 4) % elementWheel.length]] += 0.5 * bonus;
};

// Determine the counter chance of the fighter based on its current element.
// The value is recentered around 0.
// Maximum is 0.9 and minimum is 0.
export const getFighterCounter = (fighter: DetailedFighter) => {
	// Remove 1 to recenter the value at 0.
	const counterTotal = (fighter.stats.counter.global * fighter.stats.counter[fighter.element]) - 1;

	return Math.min(0.9, Math.max(0, counterTotal));
}

// Determine the multihit chance of the fighter based on its current element.
// The value is recentered around 0.
// Maximum is 0.9 and minimum is 0.
export const getFighterMultihit = (fighter: DetailedFighter) => {
	// Remove 1 to recenter the value at 0.
	const multihitTotal = (fighter.stats.multihit.global * fighter.stats.multihit[fighter.element]) - 1;

	return Math.min(0.9, Math.max(0, multihitTotal));
}

// Determine the evasion chance of the fighter based on the elements of the attack
// The value is recentered around 0.
// Maximum is 0.9 and minimum is 0.
export const getFighterEvasion = (fighter: DetailedFighter, elementAttack: [ElementType, number][]) => {
	let evasionTotal = fighter.stats.evasion.global;

	// Prorate the evasion chance base on the element
	// Example: If the attack has 9 fire and 1 wood, 90% of the fire evasion will be applied and 10% of the wood evasion will be applied
	let sumAtt = elementAttack.reduce((acc, val) => acc + val[1], 0);
	if (sumAtt > 0) {
		elementAttack.forEach(val => {
			const ele = val[0];
			const att = val[1];
			evasionTotal *= (fighter.stats.evasion[ele] * att) / sumAtt;
		});
	}

	// Remove 1 to recenter the value at 0.
	evasionTotal -= 1;

	return Math.min(0.9, Math.max(0, evasionTotal));
}

// Determine the super evasion chance of the fighter based on the elements of the attack
// The value is recentered around 0.
// Maximum is 0.9 and minimum is 0.
export const getFighterSuperEvasion = (fighter: DetailedFighter, elementAttack: [ElementType, number][]) => {
	let superEvasionTotal = fighter.stats.superEvasion.global;

	// Prorate the superEvasion chance base on the element
	// Example: If the attack has 9 fire and 1 wood, 90% of the fire superEvasion will be applied and 10% of the wood superEvasion will be applied
	let sumAtt = elementAttack.reduce((acc, val) => acc + val[1], 0);
	if (sumAtt > 0) {
		elementAttack.forEach(val => {
			const ele = val[0];
			const att = val[1];
			superEvasionTotal *= (fighter.stats.superEvasion[ele] * att) / sumAtt;
		});
	}

	// Remove 1 to recenter the value at 0.
	superEvasionTotal -= 1;

	return Math.min(0.9, Math.max(0, superEvasionTotal));
}

// Determine the armor ignore ratio of the fighter based on the elements of the attack and if the attack is an assault or not.
// The returned value is uncapped and recentered around 0
export const getFighterIgnoreArmorRatio = (fighter: DetailedFighter, elementAttack: [ElementType, number][], isAssault: boolean) => {
	let ignoreArmorRatio = fighter.stats.ignoreArmor.global;

	// Prorate the superEvasion chance base on the element
	// Example: If the attack has 9 fire and 1 wood, 90% of the fire superEvasion will be applied and 10% of the wood superEvasion will be applied
	let sumAtt = elementAttack.reduce((acc, val) => acc + val[1], 0);

	if (sumAtt > 0) {
		elementAttack.forEach(val => {
			const ele = val[0];
			const att = val[1];
			ignoreArmorRatio *= (fighter.stats.ignoreArmor[ele] * att) / sumAtt;
	});
	}

	if (isAssault) {
		ignoreArmorRatio *= fighter.stats.ignoreArmor.assault;
	}

	return ignoreArmorRatio - 1;
}

// Determine the armor ratio of the fighter based on the elements of the attack and if the attack is an assault or not.
// The returned value is uncapped and recentered around 0
export const getFighterArmorRatio = (fighter: DetailedFighter, elementAttack: [ElementType, number][]) => {
	let armorRatio = fighter.stats.armor.global;

	// Prorate the superEvasion chance base on the element
	// Example: If the attack has 9 fire and 1 wood, 90% of the fire superEvasion will be applied and 10% of the wood superEvasion will be applied
	let sumAtt = elementAttack.reduce((acc, val) => acc + val[1], 0);

	if (sumAtt > 0) {
		elementAttack.forEach(val => {
			const ele = val[0];
			const att = val[1];
			armorRatio *= (fighter.stats.armor[ele] * att) / sumAtt;
		});
	}

	return armorRatio - 1;
}


const getFighters = (team1: Team, team2: Team, place: PlaceEnum, random: seedrandom.PRNG): DetailedFighter[] => {
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
				const fighter = initializeDinoz(team, index, dinoz, place, bossFight, random);

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
						place,
						true,
						random
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
		fighters.push(...monsters.map(monster => initializeMonster(memory, team, index, monster, place, false, random)));
	});

	// Handle team wide modifiers
	fighters.forEach(fighter => {
		const team = fighter.attacker ? team1 : team2;

		// WOOD: global wood defense bonus to the team
		for (let i = 0; i < team[Skill.GARDE_FORESTIER]; i++) {
			applyGlobalDefenseBonus(fighter, ElementType.WOOD, 3);
			fighter.stats.armor.global *= 1.05;
		}
		// LIGHTNING
		for (let i = 0; i < team[Skill.ELECTROLYSE]; i++) {
			fighter.stats.speed.global *= 0.95;
		}
		// AIR
		if (team[Skill.MAITRE_LEVITATEUR]) {
			fighter.canHitFlying = true;
		}

		// ITEMS
		if (team1[Item.EMBER] || team2[Item.EMBER]) {
			fighter.stats.assaultBonus[ElementType.FIRE] += getAssaultValue(fighter, ElementType.FIRE) * 0.3;
		}
		if (team1[Item.BEER] || team2[Item.BEER]) {
			fighter.status.push(createStatus(Status.BEER));
		}
	});

	return fighters;
};

export default getFighters;
