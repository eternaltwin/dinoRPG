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

export const initializeGatherGrid = (playerId: number, placeId: number, gridInformation: GatherData) => {
	const data: Prisma.PlayerGatherCreateInput = {
		player: { connect: { id: playerId } },
		place: placeId,
		type: gridInformation.type
	};

	// Create arry with ingredientId. 0 for no element

	let grid: number[] = new Array(gridInformation.size * gridInformation.size);
	let ingredientCount = 0;

	// Generate a list of ingredient
	gridInformation.items.forEach(ingredient => {
		const buffer = new Array(ingredient.startQuantity);
		for (let i = 0; i < ingredient.ingredientId.length; i++) {
			let ingredientId = ingredient.ingredientId[Math.floor(Math.random() * ingredient.ingredientId.length)];
			if (ingredient.type === 'item') ingredientId += 1000;
			buffer[i] = ingredientId;
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
	player: PlayerForConditionCheck,
	gridInformation: GatherData,
	...box: [number, number][]
): { grid: GatherResultGrid; rewards: GatherRewards } => {
	const flatReturnGrid = getPublicGrid(grid);
	const rewards: GatherRewards = { item: [], ingredients: [] };
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
			const ingredient = Object.entries(ingredientList).find(
				ingredients => ingredients[1].ingredientId === ingredientId
			);
			if (ingredient) {
				const gridIngredient = gridInformation.items.filter(ing => ing.ingredientId.includes(ingredient[1].ingredientId));
				if (gridIngredient.length < 1) throw new Error('Ingredient not found in gridInformation.items');
				for (const possibleGater of gridIngredient) {
					if (checkCondition(possibleGater.condition, player, player.dinoz[0].id)) {
						ingredient[1].name = ingredient[0].toLowerCase();
						rewards.ingredients.push(ingredient[1])
					}
				}

			}
		}
	}

	// Unflatten the grid
	const returnGrid = [];
	for (let i = 0; i < flatReturnGrid.length; i += gridInformation.size) {
		returnGrid.push(flatReturnGrid.slice(i, i + gridInformation.size));
	}
	console.log(rewards)

	return {
		grid: returnGrid,
		rewards: rewards
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
