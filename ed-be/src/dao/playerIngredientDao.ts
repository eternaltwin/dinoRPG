import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

export const getAllIngredientsDataRequest = async (playerId: string) => {
	const ingredients = await prisma.player.findFirst({
		where: {
			id: playerId
		},
		select: {
			shopKeeper: true,
			ingredients: true
		}
	});
	return ingredients;
};

export const getIngredientsDataRequest = async (playerId: string, ingredientId: number) => {
	const ingredients = await prisma.playerIngredient.findFirst({
		where: {
			playerId,
			ingredientId
		}
	});
	return ingredients;
};

export const increaseIngredientQuantity = async (playerId: string | null, ingredientId: number, quantity: number) => {
	if (!playerId) {
		throw new ExpectedError(`No playerId for increaseIngredientQuantity`);
	}
	const ingredient = await prisma.playerIngredient.upsert({
		where: {
			ingredientId_playerId: {
				ingredientId,
				playerId
			}
		},
		create: {
			ingredientId,
			playerId,
			quantity
		},
		update: {
			quantity: {
				increment: quantity
			}
		}
	});

	return ingredient;
};

export const decreaseIngredientQuantity = async (playerId: string, ingredientId: number, quantity: number) => {
	const item = await prisma.playerIngredient.update({
		where: {
			ingredientId_playerId: {
				ingredientId,
				playerId
			}
		},
		data: {
			quantity: {
				decrement: quantity
			}
		}
	});

	// Delete ingredient if quantity is <= 0
	if (item.quantity <= 0) {
		await prisma.playerIngredient.delete({
			where: {
				ingredientId_playerId: {
					ingredientId,
					playerId
				}
			}
		});
	}
};

export async function setIngredient(item: Prisma.PlayerIngredientCreateInput) {
	return prisma.playerIngredient.create({
		data: item
	});
}

export async function setMultipleIngredient(ingredientList: Prisma.PlayerIngredientCreateManyInput[]) {
	await prisma.playerIngredient.createMany({
		data: ingredientList
	});
}

/**
 * Remove ingredients from a player only if they own enough of them. The check and the write are a single
 * statement, so concurrent requests can't spend the same ingredients twice.
 * @returns `true` if the ingredients were removed, `false` if the player does not have enough
 */
export const consumeIngredient = async (playerId: string, ingredientId: number, quantity: number): Promise<boolean> => {
	const updated = await prisma.playerIngredient.updateMany({
		where: { ingredientId, playerId, quantity: { gte: quantity } },
		data: { quantity: { decrement: quantity } }
	});

	if (updated.count === 0) {
		return false;
	}

	await prisma.playerIngredient.deleteMany({ where: { ingredientId, playerId, quantity: { lte: 0 } } });

	return true;
};
