import { GatherResultGrid } from './gatherResultGrid.mjs';
import { GatherRewards } from './gatherRewards.mjs';

export interface GatherResult {
	grid: GatherResultGrid;
	rewards: GatherRewards;
	isGridComplete: boolean;
	goldReward: number;
	ingredientsAtMaxQuantity: { ingredientId: number; quantity: number; isMaxQuantity: boolean }[];
}
