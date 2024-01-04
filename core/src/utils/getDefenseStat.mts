import { DinozFiche } from '../models/dinoz/DinozFiche.mjs';
import { DinozSkillFiche } from '../models/dinoz/DinozSkillFiche.mjs';
import { ElementType } from '../models/enums/ElementType.mjs';

export enum DefenseElement {
	FIRE = 'fire',
	WOOD = 'wood',
	WATER = 'water',
	LIGHTNING = 'lightning',
	AIR = 'air',
	NEUTRAL = 'void'
}

export const getDefenseStat = (dinoz: DinozFiche, skills: DinozSkillFiche[], elementName: DefenseElement) => {
	const elementWheel = [
		DefenseElement.FIRE,
		DefenseElement.WOOD,
		DefenseElement.WATER,
		DefenseElement.LIGHTNING,
		DefenseElement.AIR
	] as const;

	const elementStat = {
		[DefenseElement.FIRE]: dinoz.nbrUpFire || 0,
		[DefenseElement.WOOD]: dinoz.nbrUpWood || 0,
		[DefenseElement.WATER]: dinoz.nbrUpWater || 0,
		[DefenseElement.LIGHTNING]: dinoz.nbrUpLightning || 0,
		[DefenseElement.AIR]: dinoz.nbrUpAir || 0
	};

	// Sum of all elements for neutral
	if (elementName === DefenseElement.NEUTRAL) {
		return {
			name: DefenseElement.NEUTRAL,
			neutral: true,
			value: Object.values(elementStat).reduce((acc, cur) => acc + cur, 0),
			details: Object.entries(elementStat).map(([key, value]) => ({
				type: 'element',
				name: key,
				element: key,
				elements: [key],
				value,
				global: false
			}))
		};
	}

	const details: {
		type: 'skill' | 'element';
		name?: string;
		element: string;
		elements: string[];
		value: number;
		global?: boolean;
	}[] = [];

	// x1
	const element = {
		name: elementName,
		value: elementStat[elementName],
		bonus: 0,
		globalBonus: 0
	};

	// x0.5
	const firstWeakElementName =
		elementWheel[(elementWheel.indexOf(elementName) - 1 + elementWheel.length) % elementWheel.length];
	const firstWeakElement = {
		name: firstWeakElementName,
		value: elementStat[firstWeakElementName],
		bonus: 0,
		globalBonus: 0
	};
	const secondWeakElementName =
		elementWheel[(elementWheel.indexOf(elementName) - 2 + elementWheel.length) % elementWheel.length];
	const secondWeakElement = {
		name: secondWeakElementName,
		value: elementStat[secondWeakElementName],
		bonus: 0,
		globalBonus: 0
	};

	// x1.5
	const firstStrongElementName = elementWheel[(elementWheel.indexOf(elementName) + 1) % elementWheel.length];
	const firstStrongElement = {
		name: firstStrongElementName,
		value: elementStat[firstStrongElementName],
		bonus: 0,
		globalBonus: 0
	};
	const secondStrongElementName = elementWheel[(elementWheel.indexOf(elementName) + 2) % elementWheel.length];
	const secondStrongElement = {
		name: secondStrongElementName,
		value: elementStat[secondStrongElementName],
		bonus: 0,
		globalBonus: 0
	};

	// Get global bonuses from skills for the 5 elements
	[secondWeakElement, firstWeakElement, element, firstStrongElement, secondStrongElement].forEach(elem => {
		skills.forEach(skill => {
			if (!skill.globalEffects) return;

			const effect = skill.globalEffects[`${elem.name}Defense`];

			if (effect) {
				// Flat value
				elem.globalBonus += effect;

				details.push({
					type: 'skill',
					name: skill.name,
					element: elem.name,
					elements: skill.element.map(
						el =>
							Object.entries(ElementType)
								.find(([, value]) => value === el)?.[0]
								.toLocaleLowerCase() || ''
					),
					value: effect,
					global: true
				});
			}
		});
	});

	// Get fixed bonuses from skills for the main element
	skills.forEach(skill => {
		if (!skill.effects) return;

		const effect = skill.effects[`${elementName}Defense`];

		if (effect) {
			// Flat value
			element.bonus += effect;

			details.push({
				type: 'skill',
				name: skill.name,
				element: element.name,
				elements: skill.element.map(
					el =>
						Object.entries(ElementType)
							.find(([, value]) => value === el)?.[0]
							.toLocaleLowerCase() || ''
				),
				value: effect
			});
		}
	});

	const result = Math.ceil(
		0.5 * (secondWeakElement.value + secondWeakElement.globalBonus) +
			secondWeakElement.bonus +
			0.5 * (firstWeakElement.value + firstWeakElement.globalBonus) +
			firstWeakElement.bonus +
			(element.value + element.bonus) +
			element.bonus +
			1.5 * (firstStrongElement.value + firstStrongElement.globalBonus) +
			firstStrongElement.bonus +
			1.5 * (secondStrongElement.value + secondStrongElement.globalBonus) +
			secondStrongElement.bonus
	);

	return {
		name: elementName,
		strong1: firstStrongElement,
		strong2: secondStrongElement,
		weak1: firstWeakElement,
		weak2: secondWeakElement,
		element,
		details,
		value: result
	};
};
