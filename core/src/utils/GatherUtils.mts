import { PlayerGather, Prisma } from '@drpg/prisma';
import { GatherData } from '../models/gather/gatherData.mjs';
import { gatherList } from '../models/gather/gatherList.mjs';
import { GatherType } from '../models/enums/GatherType.mjs';
import { PlayerForConditionCheck } from '../constants.mjs';
import { GatherRewards } from '../models/gather/gatherRewards.mjs';
import { GatherResultGrid } from '../models/gather/gatherResultGrid.mjs';
import { Item, itemList } from '../models/item/ItemList.mjs';
import { Ingredient, ingredientList } from '../models/ingredient/ingredientList.mjs';
import { checkCondition } from './checkCondition.mjs';

export const initializeGatherGrid = (playerId: string, placeId: number, gridInformation: GatherData) => {
	const data: Prisma.PlayerGatherCreateInput = {
		player: { connect: { id: playerId } },
		place: placeId,
		type: gridInformation.type
	};

	// Create arry with ingredientId. 0 for no element

	let grid: number[] = new Array(gridInformation.size * gridInformation.size);
	let ingredientCount = 0;

	// Generate a list of ingredient
	for (const [key, item] of Object.entries(gridInformation.items)) {
		if (item) {
			const buffer = new Array(item.startQuantity);
			for (let i = 0; i < item.startQuantity; i++) {
				buffer[i] = Number(key); // Save the **key**, for proper mapping on discovery with the record.
			}

			grid.splice(ingredientCount, item.startQuantity, ...buffer);
			ingredientCount += item.startQuantity;
		}
	}

	// Fill the empty spot with 0
	grid = Array.from(grid, v => (v === undefined ? 0 : v));

	// Shuffle the ingredient list
	for (let i = grid.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[grid[i], grid[j]] = [grid[j], grid[i]];
	}

	data.grid = grid;

	return data;
};

export const hideGridIngredients = (grid: number[]) => {
	return grid.map(box => {
		if (box >= 0) return 0;
		return -1;
	});
};

export const getGridSize = (grid: Pick<PlayerGather, 'type'>) => {
	return gatherList[grid.type as GatherType].size;
};

export const getPublicGrid = (grid: Pick<PlayerGather, 'grid'>) => {
	return grid.grid.map(ingredient => (ingredient >= 0 ? 0 : -1));
};

export const discoverBox = (
	grid: Pick<PlayerGather, 'grid'>,
	player: PlayerForConditionCheck,
	gridInformation: GatherData,
	...box: [number, number][]
): {
	grid: GatherResultGrid;
	rewards: GatherRewards;
	isGridComplete: boolean;
	goldReward: number;
	ingredientsAtMaxQuantity: { ingredientId: number; quantity: number; isMaxQuantity: boolean }[];
} => {
	const flatReturnGrid = getPublicGrid(grid);
	const rewards: GatherRewards = { item: [], ingredients: [] };
	const isGridComplete = false;
	const goldReward = 0;
	const ingredientsAtMaxQuantity: { ingredientId: number; quantity: number; isMaxQuantity: boolean }[] = [];
	for (let i = 0; i < box.length; i++) {
		let boxValue: number = grid.grid[box[i][0] * gridInformation.size + box[i][1]];

		// Mark the box as discovered.
		flatReturnGrid[box[i][0] * gridInformation.size + box[i][1]] = -1;

		// If the box was not empty, get the entry from the grid
		if (boxValue !== 0) {
			let value = gridInformation.items[boxValue];
			if (!value)
				throw new Error(`Item entry ID ${boxValue} not found in gridInformation ${gridInformation.type} items`);

			// Select at random from the possibilities of that entry (don't roll the random if only one entry)
			let ingredientOrItemId =
				value.ingredientOrItemId[
					value.ingredientOrItemId.length > 1 ? Math.floor(Math.random() * value.ingredientOrItemId.length) : 0
				];

			if (checkCondition(value.condition, player, player.dinoz[0].id))
				if (value.type === 'item') {
					const item = itemList[ingredientOrItemId as Item];
					rewards.item.push({ id: item.itemId, price: item.price, maxQuantity: item.maxQuantity, quantity: 1 });
				} else {
					const ingredient = ingredientList[ingredientOrItemId as Ingredient];
					ingredient.name = ingredient.name.toLowerCase();
					rewards.ingredients.push(ingredient);
				}
		}
	}

	// Unflatten the grid
	const returnGrid = [];
	for (let i = 0; i < flatReturnGrid.length; i += gridInformation.size) {
		returnGrid.push(flatReturnGrid.slice(i, i + gridInformation.size));
	}

	return {
		grid: returnGrid,
		rewards: rewards,
		isGridComplete,
		goldReward,
		ingredientsAtMaxQuantity
	};
};

export const saveGrid = (grid: Pick<PlayerGather, 'grid' | 'type'>, ...box: [number, number][]) => {
	for (let i = 0; i < box.length; i++) {
		grid.grid[box[i][0] * getGridSize(grid) + box[i][1]] = -1;
	}

	return {
		grid: grid.grid
	};
};
