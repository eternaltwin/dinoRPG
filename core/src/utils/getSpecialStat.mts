import { DinozFiche } from '../models/dinoz/DinozFiche.mjs';
import { SkillDetails } from '../models/dinoz/SkillDetails.mjs';
import { Skill, skillList } from '../models/dinoz/SkillList.mjs';
import { DinozStatusId } from '../models/dinoz/StatusList.mjs';
import { ElementType } from '../models/enums/ElementType.mjs';
import { Item, itemList } from '../models/item/ItemList.mjs';

export enum SpecialStat {
	HP_REGEN = 'hpRegen',
	INITIATIVE = 'initiative',
	ENERGY = 'energy',
	ENERGY_RECOVERY = 'energyRecovery',
	MAX_FOLLOWERS = 'maxFollowers',
	ARMOR = 'armor',
	MULTIHIT = 'multihit',
	EVASION = 'evasion',
	SUPER_EVASION = 'superEvasion',
	COUNTER = 'counter',
	BUBBLE_RATE = 'bubbleRate',
	TORCH_DAMAGE = 'torchDamage',
	ACID_BLOOD_DAMAGE = 'acidBloodDamage'
}

export enum SpecialStatAsPercent {
	ARMOR = 'armor',
	MULTIHIT = 'multihit',
	EVASION = 'evasion',
	SUPER_EVASION = 'superEvasion',
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
	[SpecialStat.ENERGY]: 100,
	[SpecialStat.ENERGY_RECOVERY]: 1,
	[SpecialStat.MAX_FOLLOWERS]: 2
};

export const getSpecialStat = (
	dinoz: Pick<DinozFiche, 'items' | 'nbrUpFire' | 'nbrUpWood' | 'nbrUpLightning' | 'nbrUpAir' | 'nbrUpWater'>,
	statuses: DinozStatusId[],
	skills: Pick<SkillDetails, 'id' | 'effects' | 'name' | 'element'>[],
	stat: SpecialStat,
	PRIEST?: boolean
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
			multiplier: false,
			// Clamp value between 30% and 100%
			value: (value < 0.3 ? 0.3 : value) + 1
		};
	}

	// Special case for TORCH_DAMAGE (value not influenced by skills)
	if (stat === SpecialStat.TORCH_DAMAGE) {
		// Return null if no lighter in inventory and no torch skill
		if (
			!dinoz.items?.some(item => item === itemList[Item.ZIPPO].itemId) &&
			!skills.some(skill => skill.id === Skill.TORCHE)
		) {
			return null;
		}

		return {
			name: 'torchDamage',
			// Fire
			value: dinoz.nbrUpFire || 1,
			details: [
				{
					type: 'base',
					name: 'base',
					percent: false,
					multiplier: false,
					elements: ['fire'],
					value: dinoz.nbrUpFire || 1
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
					name: 'base',
					percent: false,
					multiplier: false,
					elements: ['water'],
					value: dinoz.nbrUpWater || 0
				}
			]
		};
	}

	let value = BaseStats[stat];
	let base_stat = value;
	let multiplier = 1;
	let details: {
		type: 'skill' | 'status' | 'base';
		name: string;
		percent: boolean;
		multiplier: boolean;
		elements: string[];
		value: number;
	}[] = [];

	const percent = (Object.values(SpecialStatAsPercent) as string[]).includes(stat);

	// Add base details if not 0
	if (value !== 0) {
		details.push({
			type: 'base',
			name: 'base',
			percent,
			multiplier: false,
			elements: [],
			value: percent ? value * 100 : value
		});
	}

	// Start as 1 for percent stats to allow multiplication
	if (percent) {
		value += 1;
	}

	// Apply bonuses from statuses
	statuses.forEach(status => {
		switch (status) {
			case DinozStatusId.CUSCOUZ_MALEDICTION: {
				if (stat === SpecialStat.ARMOR) {
					value *= 0.7;

					details.push({
						type: 'status',
						name: DinozStatusId.CUSCOUZ_MALEDICTION.toString(),
						percent: true,
						multiplier: true,
						elements: [],
						value: 0.7
					});
				}
				break;
			}
			default:
				break;
		}
	});

	// Apply bonuses from skills
	skills.forEach(skill => {
		if (!skill.effects) return;

		const effect = skill.effects[stat];
		const isAddition = typeof effect === 'number';

		if (effect) {
			let effectValue = 0;

			// Flat value
			if (isAddition) {
				effectValue = effect;
				value += effect;
			} else {
				// Multiplier
				effectValue = effect[1] - 1;
				multiplier *= effect[1];
			}

			const percent = (Object.values(SpecialStatAsPercent) as string[]).includes(stat.toString());

			let finalValue;
			if (percent) {
				// Multiply by 100 for a percent
				finalValue = Math.round(effectValue * 100);
			} else {
				// Other use the effect value
				finalValue = effectValue;
			}
			if (base_stat > 0 && !isAddition) {
				// For multipliers, add 1 to the final value so it shows as "x 1.20" (for example)
				finalValue += 1;
			}

			details.push({
				type: 'skill',
				name: skill.name,
				percent,
				multiplier: !isAddition,
				elements: skill.element.map(
					el =>
						Object.entries(ElementType)
							.find(([, value]) => value === el)?.[0]
							.toLocaleLowerCase() || ''
				),
				value: finalValue
			});
		}
	});

	// Apply bonuses from priest
	if (stat === SpecialStat.HP_REGEN && PRIEST) {
		value++;
		details.push({
			type: 'skill',
			name: skillList[Skill.PRETRE].name,
			percent: false,
			multiplier: false,
			elements: [],
			value: 1
		});
	}

	// Order details by value type (multiplier last) (base first)
	details = details.sort((a, b) => {
		if (a.type === b.type) {
			return a.percent === b.percent ? 0 : a.percent ? 1 : -1;
		}

		return a.type === 'base' ? -1 : 1;
	});

	return {
		name: stat,
		percent,
		value: +(value * multiplier),
		details
	};
};
