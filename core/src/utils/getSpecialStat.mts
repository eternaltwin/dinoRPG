import { DinozFiche } from "../models/dinoz/DinozFiche.mjs";
import { levelList } from "../models/dinoz/DinozLevel.mjs";

export enum SpecialStat {
	HP_REGEN = "hpRegen",
	INITIATIVE = "initiative",
	ENERGY = "energy",
	ENERGY_RECOVERY = "energyRecovery",
	MAX_FOLLOWERS = "maxFollowers",
	ARMOR = "armor",
	MULTIHIT = "multihit",
	EVASION = "evasion",
	COUNTER = "counter",
	BUBBLE_RATE = "bubbleRate",
	TORCH_DAMAGE = "torchDamage",
	ACID_BLOOD_DAMAGE = "acidBloodDamage",
}

export const BASE_HP_REGEN = 1;

export const getSpecialStat = (
	dinoz: DinozFiche,
	elementName: SpecialStat
) => {
	return 0;
};
