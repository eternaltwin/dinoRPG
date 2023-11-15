import { DinozFiche } from "../models/dinoz/DinozFiche.mjs";

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
		[DefenseElement.FIRE]: (dinoz.nbrUpFire || 0) + 0, // TODO: bonus
		[DefenseElement.WOOD]: (dinoz.nbrUpWood || 0) + 0, // TODO: bonus
		[DefenseElement.WATER]: (dinoz.nbrUpWater || 0) + 0, // TODO: bonus
		[DefenseElement.LIGHTNING]: (dinoz.nbrUpLightning || 0) + 0, // TODO: bonus
		[DefenseElement.AIR]: (dinoz.nbrUpAir || 0) + 0, // TODO: bonus
	};

	// Sum of all elements (without bonus) for neutral
	if (elementName === DefenseElement.NEUTRAL) {
		return (dinoz.nbrUpFire || 0) + (dinoz.nbrUpWood || 0) + (dinoz.nbrUpWater || 0) + (dinoz.nbrUpLightning || 0) + (dinoz.nbrUpAir || 0);
	}

	let element = elementStat[elementName] || 0;
	let weakElement = elementStat[elementWheel[(elementWheel.indexOf(elementName) - 1 + elementWheel.length) % elementWheel.length]];
	let strongElement = elementStat[elementWheel[(elementWheel.indexOf(elementName) + 1) % elementWheel.length]];

	return 0.5 * weakElement + element + 1.5 * strongElement;
};
