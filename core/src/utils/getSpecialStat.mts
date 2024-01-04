import { DinozFiche } from '../models/dinoz/DinozFiche.mjs';
import { DinozSkillFiche } from '../models/dinoz/DinozSkillFiche.mjs';
import { Skill } from '../models/dinoz/SkillList.mjs';
import { ElementType } from '../models/enums/ElementType.mjs';
import { itemList } from '../models/item/ItemList.mjs';

export enum SpecialStat {
	HP_REGEN = 'hpRegen',
	INITIATIVE = 'initiative',
	ENERGY = 'energy',
	ENERGY_RECOVERY = 'energyRecovery',
	MAX_FOLLOWERS = 'maxFollowers',
	ARMOR = 'armor',
	MULTIHIT = 'multihit',
	EVASION = 'evasion',
	COUNTER = 'counter',
	BUBBLE_RATE = 'bubbleRate',
	TORCH_DAMAGE = 'torchDamage',
	ACID_BLOOD_DAMAGE = 'acidBloodDamage'
}

export enum SpecialStatAsPercent {
	ENERGY = 'energy',
	MULTIHIT = 'multihit',
	EVASION = 'evasion',
	COUNTER = 'counter',
	BUBBLE_RATE = 'bubbleRate'
}

export type SpecialStatUsedInFights = Exclude<SpecialStat, SpecialStat.HP_REGEN | SpecialStat.MAX_FOLLOWERS>;

export const BaseStats = {
	...Object.values(SpecialStat).reduce(
		(acc, value) => {
			acc[value] = 0;
			return acc;
		},
		{} as Record<SpecialStat, number>
	),
	[SpecialStat.HP_REGEN]: 1,
	[SpecialStat.ENERGY]: 1,
	[SpecialStat.MAX_FOLLOWERS]: 2
};

export const getSpecialStat = (
	dinoz: Pick<DinozFiche, 'items' | 'nbrUpFire' | 'nbrUpWood' | 'nbrUpLightning' | 'nbrUpAir' | 'nbrUpWater'>,
	skills: (Pick<DinozSkillFiche, 'id' | 'effects' | 'name' | 'element'>)[],
	stat: SpecialStat,
) => {
	// Special case for BUBBLE_RATE (value not influenced by skills)
	if (stat === SpecialStat.BUBBLE_RATE) {
		// Return null if no bubble skill
		if (!skills.some(skill => skill.id === Skill.BULLE)) {
			return null;
		}

		// (Water + Air) / All
		const value =
			((dinoz.nbrUpWater || 0) + (dinoz.nbrUpAir || 0)) /
			((dinoz.nbrUpWater || 0) +
				(dinoz.nbrUpWood || 0) +
				(dinoz.nbrUpFire || 0) +
				(dinoz.nbrUpLightning || 0) +
				(dinoz.nbrUpAir || 0));

		return {
			name: 'bubbleRate',
			percent: true,
			// Clamp value between 30% and 100%
			value: Math.ceil((value < 0.3 ? 0.3 : value) * 100)
		};
	}

	// Special case for TORCH_DAMAGE (value not influenced by skills)
	if (stat === SpecialStat.TORCH_DAMAGE) {
		// Return null if no lighter in inventory
		if (!dinoz.items?.some(item => item === itemList.ZIPPO.itemId)) {
			return null;
		}

		return {
			name: 'torchDamage',
			// Fire
			value: dinoz.nbrUpFire || 0,
			details: [
				{
					type: 'base',
					percent: false,
					elements: ['fire'],
					value: dinoz.nbrUpFire || 0
				}
			]
		};
	}

	// Special case for ACID_BLOOD_DAMAGE (value not influenced by skills)
	if (stat === SpecialStat.ACID_BLOOD_DAMAGE) {
		// Return null if no acid blood skill
		if (!skills.some(skill => skill.id === Skill.SANG_ACIDE)) {
			return null;
		}

		return {
			name: 'acidBloodDamage',
			// Water / 2
			value: Math.ceil((dinoz.nbrUpWater || 0) / 2),
			details: [
				{
					type: 'base',
					percent: false,
					elements: ['water'],
					value: dinoz.nbrUpWater || 0
				}
			]
		};
	}

	let value = BaseStats[stat];
	let multiplier = 1;
	let details: {
		type: 'skill' | 'base';
		name?: string;
		percent: boolean;
		elements: string[];
		value: number | ['x', number];
	}[] = [];

	// Add base details if not 0
	if (value !== 0) {
		const percent = (Object.values(SpecialStatAsPercent) as string[]).includes(stat.toString());

		details.push({
			type: 'base',
			percent,
			elements: [],
			value: percent ? value * 100 : value
		});
	}

	// Apply bonuses from skills
	skills.forEach(skill => {
		if (!skill.effects) return;

		const effect = skill.effects[stat];

		if (effect) {
			let effectValue = 0;

			// Flat value
			if (typeof effect === 'number') {
				effectValue = effect;
				value += effect;
			} else {
				// Multiplier
				effectValue = effect[1];
				multiplier += effect[1];
			}

			const percent = (Object.values(SpecialStatAsPercent) as string[]).includes(stat.toString());

			details.push({
				type: 'skill',
				name: skill.name,
				percent,
				elements: skill.element.map(
					el =>
						Object.entries(ElementType)
							.find(([, value]) => value === el)?.[0]
							.toLocaleLowerCase() || ''
				),
				value: percent ? effectValue * 100 : effectValue
			});
		}
	});

	// Order details by by value type (multiplier last) (base first)
	details = details.sort((a, b) => {
		if (a.type === b.type) {
			return a.percent === b.percent ? 0 : a.percent ? 1 : -1;
		}

		return a.type === 'base' ? -1 : 1;
	});

	const percent = (Object.values(SpecialStatAsPercent) as string[]).includes(stat.toString());

	return {
		name: stat,
		percent,
		value: percent ? Math.ceil(value * multiplier * 100) : Math.ceil(value * multiplier),
		details
	};
};
