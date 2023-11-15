import { DinozFiche } from "../models/dinoz/DinozFiche.mjs";
import { DinozSkillFiche } from "../models/dinoz/DinozSkillFiche.mjs";
import { ElementType } from "../models/enums/ElementType.mjs";
import { Stat } from "../models/enums/SkillStat.mjs";

export enum DefenseElement {
	FIRE = "fire",
	WOOD = "wood",
	WATER = "water",
	LIGHTNING = "lightning",
	AIR = "air",
	NEUTRAL = "void",
}

export const getDefenseStat = (
	dinoz: DinozFiche,
	skills: DinozSkillFiche[],
	elementName: DefenseElement
) => {
	const elementWheel = [
		DefenseElement.FIRE,
		DefenseElement.WOOD,
		DefenseElement.WATER,
		DefenseElement.LIGHTNING,
		DefenseElement.AIR
	] as const;

	const elementStat = {
		[DefenseElement.FIRE]: (dinoz.nbrUpFire || 0),
		[DefenseElement.WOOD]: (dinoz.nbrUpWood || 0),
		[DefenseElement.WATER]: (dinoz.nbrUpWater || 0),
		[DefenseElement.LIGHTNING]: (dinoz.nbrUpLightning || 0),
		[DefenseElement.AIR]: (dinoz.nbrUpAir || 0),
	};

	// Sum of all elements for neutral
	if (elementName === DefenseElement.NEUTRAL) {
		return {
			neutral: true,
			value: Object.values(elementStat).reduce((acc, cur) => acc + cur, 0),
			details: Object.entries(elementStat).map(([key, value]) => ({
				type: "element",
				elements: [key],
				value,
			})),
		};
	}

	const details: {
		type: "skill" | "element";
		name?: string;
		elements: string[];
		value: number;
	}[] = [];

	const element = {
		name: elementName,
		value: elementStat[elementName],
		bonus: 0,
	};
	const weakElementName = elementWheel[(elementWheel.indexOf(elementName) - 1 + elementWheel.length) % elementWheel.length];
	const weakElement = {
		name: weakElementName,
		value: elementStat[weakElementName],
		bonus: 0,
	}
	const strongElementName = elementWheel[(elementWheel.indexOf(elementName) + 1) % elementWheel.length];
	const strongElement = {
		name: strongElementName,
		value: elementStat[strongElementName],
		bonus: 0,
	};

	// Get bonuses from skills for the 3 elements
	[weakElement, element, strongElement].forEach((elem) => {
		skills.forEach((skill) => {
			if (!skill.effects) return;

			const effect = skill.effects[`${elem.name}Defense`];

			if (effect) {
				// Flat value
				elem.bonus += effect;

				// Keep details for the base element only
				if (elem.name === elementName) {
					details.push({
						type: "skill",
						name: skill.name,
						elements: skill.element.map((el) => Object.entries(ElementType).find(([key, value]) => value === el)![0].toLocaleLowerCase()),
						value: effect,
					});
				}
			}
		});
	});

	const result = Math.ceil(0.5 * (weakElement.value + weakElement.bonus)
		+ (element.value + element.bonus)
		+ 1.5 * (strongElement.value + strongElement.bonus));

	return {
		strong: strongElement,
		weak: weakElement,
		element,
		details,
		value: result,
	};
};
