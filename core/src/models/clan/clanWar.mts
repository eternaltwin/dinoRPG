import { treasureIngredient } from './clan.mjs';

export const WAR_BASE_VALUE = 22_500;
export const WAR_SCALE_PER_100_POINTS = 5_625;
export const REPAIR_MAX_TICKS = 15;
export const REPAIR_MAX_STACK = 2;
export const REPAIR_BASE_VALUE = 500;
export const REPAIR_SCALE_FACTOR = 1.2;
export const REPAIR_MAX_HP = 75;

export type WarCost = {
	ingredients: treasureIngredient[];
	trueValue: number;
	totalValue: number;
	canAfford: boolean;
	totalHp?: number;
};

export enum RepairFrequency {
	ONE_MIN = 1,
	FIVE_MIN = 5,
	FIFTEEN_MIN = 15,
	THIRTY_MIN = 30
}

export type RepairCostIngredient = {
	ingredientId: number;
	quantity: number;
};

export type RepairCost = {
	ingredients: RepairCostIngredient[];
	totalValue: number;
	canAfford: boolean;
};

export type WAR_NOTIFICATION = {
	attacker: string;
	hpLost: number;
};
