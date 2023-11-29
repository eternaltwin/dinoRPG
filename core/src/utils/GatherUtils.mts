import { PlayerGather, Prisma } from '@drpg/prisma';
import { GatherData } from '../models/gather/gatherData.mjs';
import { gatherList } from '../models/gather/gatherList.mjs';
import { GatherType } from '../models/enums/GatherType.mjs';
import { DinozForConditionCheck } from '../constants.mjs';
import { GatherRewards } from '../models/gather/gatherRewards.mjs';
import { GatherResultGrid } from '../models/gather/gatherResultGrid.mjs';
import { itemList } from '../models/item/ItemList.mjs';
import { ingredientList } from '../models/ingredient/ingredientList.mjs';
import { checkCondition } from './checkCondition.mjs';

export const initializeGatherGrid = (
	playerId: number,
	placeId: number,
	gridInformation: GatherData,
	gridId?: number
) => {
	const data: Prisma.PlayerGatherCreateInput & {
		id?: number;
	} = {
		id: gridId || undefined,
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
		let ingredientId = ingredient.ingredientId;
		if (ingredient.type === 'item') ingredientId += 1000;
		buffer.fill(ingredientId);
		grid.splice(ingredientCount, ingredient.startQuantity, ...buffer);
		ingredientCount += ingredient.startQuantity;
	});

	//Fill the empty spot with 0
	grid = Array.from(grid, v => (v === undefined ? 0 : v));

	//Shuffle the ingredient list
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
	dinoz: DinozForConditionCheck,
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
			const item = Object.entries(itemList).find(items => items[1].itemId === ingredientId);
			if (item) {
				item[1].name = item[0].toLowerCase();
				item[1] ? rewards.item.push(item[1]) : 0;
			}
		} else {
			const ingredient = Object.entries(ingredientList).find(
				ingredients => ingredients[1].ingredientId === ingredientId
			);
			if (ingredient) {
				const gridIngredient = gridInformation.items.find(ing => ing.ingredientId === ingredient[1].ingredientId);
				if (!gridIngredient) throw new Error('Ingredient not found in gridInformation.items');
				const condition = gridIngredient.condition;
				ingredient[1].name = ingredient[0].toLowerCase() as Lowercase<string>;
				ingredient[1] && checkCondition(condition, [dinoz]) ? rewards.ingredients.push(ingredient[1]) : 0;
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
		rewards: rewards
	};
};

export const saveGrid = (grid: Pick<PlayerGather, 'grid' | 'id' | 'type'>, ...box: [number, number][]) => {
	for (let i = 0; i < box.length; i++) {
		grid.grid[box[i][0] * getGridSize(grid) + box[i][1]] = -1;
	}
	return {
		id: grid.id,
		grid: grid.grid
	};
};
