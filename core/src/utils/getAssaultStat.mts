import { DinozFiche } from '../models/dinoz/DinozFiche.mjs';
import { DinozSkillFiche } from '../models/dinoz/DinozSkillFiche.mjs';
import { ElementType } from '../models/enums/ElementType.mjs';
import { Stat } from '../models/enums/SkillStat.mjs';

export enum AssaultElement {
	FIRE = 'fire',
	WOOD = 'wood',
	WATER = 'water',
	LIGHTNING = 'lightning',
	AIR = 'air'
}

export const getAssaultStat = (
	dinoz: Pick<DinozFiche, 'nbrUpFire' | 'nbrUpWood' | 'nbrUpLightning' | 'nbrUpAir' | 'nbrUpWater'>,
	skills: (Pick<DinozSkillFiche, 'effects' | 'name' | 'element'>)[],
	elementName: AssaultElement,
	power = 5,
) => {
	let element = 0;
	switch (elementName) {
		case 'fire':
			element = dinoz.nbrUpFire || 0;
			break;
		case 'wood':
			element = dinoz.nbrUpWood || 0;
			break;
		case 'lightning':
			element = dinoz.nbrUpLightning || 0;
			break;
		case 'air':
			element = dinoz.nbrUpAir || 0;
			break;
		case 'water':
			element = dinoz.nbrUpWater || 0;
			break;
		default:
			throw new Error(`Element ${elementName} not found`);
	}

	let bonus = 0;
	const details: {
		type: 'skill' | 'element';
		name?: string;
		elements: string[];
		value: number;
	}[] = [];

	details.push({
		type: 'element',
		elements: [elementName],
		value: element
	});

	// Get bonuses from skills
	skills.forEach(skill => {
		if (!skill.effects) return;

		const effect = skill.effects[`${elementName}Assault`];

		if (effect) {
			// Flat value
			if (typeof effect === 'number') {
				bonus += effect;
				details.push({
					type: 'skill',
					name: skill.name,
					elements: skill.element.map(
						element =>
							Object.entries(ElementType)
								.find(([, value]) => value === element)?.[0]
								.toLocaleLowerCase() || ''
					),
					value: effect
				});
			} else {
				// Other element value
				let otherElementValue = 0;
				switch (effect) {
					case Stat.FIRE_ASSAULT:
						otherElementValue = dinoz.nbrUpFire || 0;
						break;
					case Stat.WOOD_ASSAULT:
						otherElementValue = dinoz.nbrUpWood || 0;
						break;
					case Stat.LIGHTNING_ASSAULT:
						otherElementValue = dinoz.nbrUpLightning || 0;
						break;
					case Stat.AIR_ASSAULT:
						otherElementValue = dinoz.nbrUpAir || 0;
						break;
					case Stat.WATER_ASSAULT:
						otherElementValue = dinoz.nbrUpWater || 0;
						break;
					default:
						break;
				}

				bonus += otherElementValue;
				details.push({
					type: 'skill',
					name: skill.name,
					elements: skill.element.map(
						element =>
							Object.entries(ElementType)
								.find(([, value]) => value === element)?.[0]
								.toLocaleLowerCase() || ''
					),
					value: otherElementValue
				});
			}
		}
	});

	const result = element * power + bonus;

	return {
		name: elementName,
		value: result,
		details
	};
};
