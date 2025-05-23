import { SkillDetails } from '../models/dinoz/SkillDetails.mjs';
import { ElementType } from '../models/enums/ElementType.mjs';
import { Stat } from '../models/enums/SkillStat.mjs';

// Special statistics that exist in both global and elemental form.
// They combine multiplicatively.
// For example: final speed is global speed multiplied by speed of the current element.
export enum ElementStat {
	// Counters
	COUNTER = 'counter',
	FIRE_COUNTER = 'fireCounter',
	WOOD_COUNTER = 'woodCounter',
	WATER_COUNTER = 'waterCounter',
	LIGHTNING_COUNTER = 'lightningCounter',
	AIR_COUNTER = 'airCounter',
	// Armor Ignores
	IGNORE_ARMOR = 'ignoreArmor',
	ASSAULT_IGNORE_ARMOR = 'assaultIgnoreArmor',
	FIRE_IGNORE_ARMOR = 'fireIgnoreArmor',
	WOOD_IGNORE_ARMOR = 'woodIgnoreArmor',
	WATER_IGNORE_ARMOR = 'waterIgnoreArmor',
	LIGHTNING_IGNORE_ARMOR = 'lightningIgnoreArmor',
	AIR_IGNORE_ARMOR = 'airIgnoreArmor',
	// Evasions
	EVASION = 'evasion',
	FIRE_EVASION = 'fireEvasion',
	WOOD_EVASION = 'woodEvasion',
	WATER_EVASION = 'waterEvasion',
	LIGHTNING_EVASION = 'lightningEvasion',
	AIR_EVASION = 'airEvasion',
	// Super evasions
	SUPER_EVASION = 'superEvasion',
	FIRE_SUPER_EVASION = 'fireSuperEvasion',
	WOOD_SUPER_EVASION = 'woodSuperEvasion',
	WATER_SUPER_EVASION = 'waterSuperEvasion',
	LIGHTNING_SUPER_EVASION = 'lightningSuperEvasion',
	AIR_SUPER_EVASION = 'airSuperEvasion',
	// Multihits
	MULTIHIT = 'multihit',
	FIRE_MULTIHIT = 'fireMultihit',
	WOOD_MULTIHIT = 'woodMultihit',
	WATER_MULTIHIT = 'waterMultihit',
	LIGHTNING_MULTIHIT = 'lightningMultihit',
	AIR_MULTIHIT = 'airMultihit',
	// Speeds
	SPEED = 'speed',
	FIRE_SPEED = 'fireSpeed',
	WOOD_SPEED = 'woodSpeed',
	WATER_SPEED = 'waterSpeed',
	LIGHTNING_SPEED = 'lightningSpeed',
	AIR_SPEED = 'airSpeed'
}

export const ElementBaseStats = {
	// Counters
	[Stat.COUNTER]: 0,
	[Stat.FIRE_COUNTER]: 0,
	[Stat.WOOD_COUNTER]: 0,
	[Stat.WATER_COUNTER]: 0,
	[Stat.LIGHTNING_COUNTER]: 0,
	[Stat.AIR_COUNTER]: 0,
	// Armor ignores
	[Stat.IGNORE_ARMOR]: 0,
	[Stat.ASSAULT_IGNORE_ARMOR]: 0,
	[Stat.FIRE_IGNORE_ARMOR]: 0,
	[Stat.WOOD_IGNORE_ARMOR]: 0,
	[Stat.WATER_IGNORE_ARMOR]: 0,
	[Stat.LIGHTNING_IGNORE_ARMOR]: 0,
	[Stat.AIR_IGNORE_ARMOR]: 0,
	// Evasions
	[Stat.EVASION]: 0,
	[Stat.FIRE_EVASION]: 0,
	[Stat.WOOD_EVASION]: 0,
	[Stat.WATER_EVASION]: 0,
	[Stat.LIGHTNING_EVASION]: 0,
	[Stat.AIR_EVASION]: 0,
	// Super evasions
	[Stat.SUPER_EVASION]: 0,
	[Stat.FIRE_SUPER_EVASION]: 0,
	[Stat.WOOD_SUPER_EVASION]: 0,
	[Stat.WATER_SUPER_EVASION]: 0,
	[Stat.LIGHTNING_SUPER_EVASION]: 0,
	[Stat.AIR_SUPER_EVASION]: 0,
	// Multihits
	[Stat.MULTIHIT]: 0,
	[Stat.FIRE_MULTIHIT]: 0,
	[Stat.WOOD_MULTIHIT]: 0,
	[Stat.WATER_MULTIHIT]: 0,
	[Stat.LIGHTNING_MULTIHIT]: 0,
	[Stat.AIR_MULTIHIT]: 0,
	// Speeds
	[Stat.SPEED]: 1,
	[Stat.FIRE_SPEED]: 1,
	[Stat.WOOD_SPEED]: 1,
	[Stat.WATER_SPEED]: 1,
	[Stat.LIGHTNING_SPEED]: 1,
	[Stat.AIR_SPEED]: 1
};

export enum ElementStatAsPercent {
	// Counters
	COUNTER = 'counter',
	FIRE_COUNTER = 'fireCounter',
	WOOD_COUNTER = 'woodCounter',
	WATER_COUNTER = 'waterCounter',
	LIGHTNING_COUNTER = 'lightningCounter',
	AIR_COUNTER = 'airCounter',
	// Armor Ignores
	IGNORE_ARMOR = 'ignoreArmor',
	ASSAULT_IGNORE_ARMOR = 'assaultIgnoreArmor',
	FIRE_IGNORE_ARMOR = 'fireIgnoreArmor',
	WOOD_IGNORE_ARMOR = 'woodIgnoreArmor',
	WATER_IGNORE_ARMOR = 'waterIgnoreArmor',
	LIGHTNING_IGNORE_ARMOR = 'lightningIgnoreArmor',
	AIR_IGNORE_ARMOR = 'airIgnoreArmor',
	// Evasions
	EVASION = 'evasion',
	FIRE_EVASION = 'fireEvasion',
	WOOD_EVASION = 'woodEvasion',
	WATER_EVASION = 'waterEvasion',
	LIGHTNING_EVASION = 'lightningEvasion',
	AIR_EVASION = 'airEvasion',
	// Super evasions
	SUPER_EVASION = 'superEvasion',
	FIRE_SUPER_EVASION = 'fireSuperEvasion',
	WOOD_SUPER_EVASION = 'woodSuperEvasion',
	WATER_SUPER_EVASION = 'waterSuperEvasion',
	LIGHTNING_SUPER_EVASION = 'lightningSuperEvasion',
	AIR_SUPER_EVASION = 'airSuperEvasion',
	// Multihits
	MULTIHIT = 'multihit',
	FIRE_MULTIHIT = 'fireMultihit',
	WOOD_MULTIHIT = 'woodMultihit',
	WATER_MULTIHIT = 'waterMultihit',
	LIGHTNING_MULTIHIT = 'lightningMultihit',
	AIR_MULTIHIT = 'airMultihit'
}

export const getElementStat = (
	skills: Pick<SkillDetails, 'id' | 'effects' | 'name' | 'element'>[],
	stat: ElementStat
) => {
	let value = ElementBaseStats[stat];
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

	const percent = (Object.values(ElementStatAsPercent) as string[]).includes(stat);

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

	// Apply bonuses from statuses (not used so far so commented)
	// statuses.forEach(status => {
	// 	switch (status) {
	// 		case DinozStatusId.CUSCOUZ_MALEDICTION: {
	// 			if (stat === SpecialStat.ARMOR) {
	// 				value *= 0.7;

	// 				details.push({
	// 					type: 'status',
	// 					name: DinozStatusId.CUSCOUZ_MALEDICTION.toString(),
	// 					percent: true,
	// 					multiplier: true,
	// 					elements: [],
	// 					value: 0.7
	// 				});
	// 			}
	// 			break;
	// 		}
	// 		default:
	// 			break;
	// 	}
	// });

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
