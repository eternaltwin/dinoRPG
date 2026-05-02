export const WAR_BASE_VALUE = 22_500;
export const WAR_SCALE_PER_100_POINTS = 5_625;

export type WarCostIngredient = {
	ingredientId: number;
	quantity: number;
};

export type WarCost = {
	ingredients: WarCostIngredient[];
	totalValue: number;
	canAfford: boolean;
};
