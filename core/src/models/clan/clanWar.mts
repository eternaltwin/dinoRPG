import { treasureIngredient } from './clan.mjs';

export const WAR_BASE_VALUE = 11_250;
export const WAR_SCALE_PER_100_POINTS = 2_250;
export const REPAIR_MAX_TICKS = 15;
export const REPAIR_MAX_STACK = 2;
export const REPAIR_BASE_VALUE = 500;
export const REPAIR_SCALE_FACTOR = 1.2;
export const REPAIR_MAX_HP = 75;
export const RESTING_ATTACK_TIMER = 1_000 * 60 * 10;

export const PROSPECTOR_STANDING_REWARD_BASE = 5;
export const PROSPECTOR_DESTROYED_PENALTY_BASE = 5;
export const PROSPECTOR_STREAK_CAP = 7;
// Visit windows (local server time, 24h). One random visit per window per day.
export const PROSPECTOR_MORNING_WINDOW = { startHour: 6, endHour: 11 };
export const PROSPECTOR_EVENING_WINDOW = { startHour: 18, endHour: 23 };

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

export type PROSPECTOR_NOTIFICATION = {
	standing: boolean;
	reputation: number;
};
