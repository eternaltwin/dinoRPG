import { PlayerGather, Prisma } from '@drpg/prisma';
import { GatherData } from '../models/gather/gatherData.mjs';
import { gatherList } from '../models/gather/gatherList.mjs';
import { GatherType } from '../models/enums/GatherType.mjs';
import { PlayerForConditionCheck } from '../constants.mjs';
import { GatherRewards } from '../models/gather/gatherRewards.mjs';
import { GatherResultGrid } from '../models/gather/gatherResultGrid.mjs';
import { Item, itemList } from '../models/item/ItemList.mjs';
import { ingredientList } from '../models/ingredient/ingredientList.mjs';
import { checkCondition } from './checkCondition.mjs';

export const initializeGatherGrid = (playerId: string, placeId: number, gridInformation: GatherData, player: PlayerForConditionCheck) => {
	const data: Prisma.PlayerGatherCreateInput = {
		player: { connect: { id: playerId } },
		place: placeId,
		type: gridInformation.type
	};

	// Create array with ingredientId. 0 for no element

	let grid: number[] = new Array(gridInformation.size * gridInformation.size);
	let ingredientCount = 0;

	// Generate a list of ingredient
	gridInformation.items.forEach(ingredient => {
		const buffer = new Array(ingredient.startQuantity);
		for (let i = 0; i < ingredient.startQuantity; i++) {
			// Pick a random ingredient if multiple are possible.
			let ingredientId = ingredient.ingredientId[Math.floor(Math.random() * ingredient.ingredientId.length)];
			if (ingredient.type === 'item') ingredientId += 1000;
			// Add ingredient if conditions are met
			if (checkCondition(ingredient.condition, player, player.dinoz[0].id)) {
				buffer[i] = ingredientId;
			}
		}

		grid.splice(ingredientCount, ingredient.startQuantity, ...buffer);
		ingredientCount += ingredient.startQuantity;
	});

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
		let ingredientId: number = grid.grid[box[i][0] * gridInformation.size + box[i][1]];
		let itemCheck = false;
		if (ingredientId > 1000) {
			ingredientId -= 1000;
			itemCheck = true;
		}
		flatReturnGrid[box[i][0] * gridInformation.size + box[i][1]] = -1;

		if (itemCheck) {
			const item = itemList[ingredientId as Item];
			rewards.item.push({ id: item.itemId, price: item.price, maxQuantity: item.maxQuantity, quantity: 1 });
		} else {
			const ingredient = Object.values(ingredientList).find(
				ingredientFiche => ingredientFiche.ingredientId === ingredientId
			);
			if (ingredient) {
				ingredient.name = ingredient.name.toLowerCase();
				rewards.ingredients.push(ingredient);
			} else if (ingredientId === 0) { // NOOP, this is the ID of an empty space in the grid 
			} else {
				throw new Error(`Unknown ingredient ${ingredientId} in grid`);
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
