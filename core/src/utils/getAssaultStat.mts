import { DinozFiche } from "../models/dinoz/DinozFiche.mjs";
import { levelList } from "../models/dinoz/DinozLevel.mjs";

export enum AssaultElement {
	FIRE = "fire",
	WOOD = "wood",
	LIGHTNING = "lightning",
	AIR = "air",
	WATER = "water",
}

export const getAssaultStat = (
	dinoz: DinozFiche,
	elementName: AssaultElement
) => {
	let element = 0;
	switch (elementName) {
		case "fire":
			element = dinoz.nbrUpFire || 0;
			break;
		case "wood":
			element = dinoz.nbrUpWood || 0;
			break;
		case "lightning":
			element = dinoz.nbrUpLightning || 0;
			break;
		case "air":
			element = dinoz.nbrUpAir || 0;
			break;
		case "water":
			element = dinoz.nbrUpWater || 0;
			break;
		default:
			throw new Error(`Element ${elementName} not found`);
	}

	let bonus = 0;

	return element * 5 + bonus;
};
