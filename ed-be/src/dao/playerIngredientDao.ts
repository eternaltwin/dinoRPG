import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import type { TxClient } from './transaction.js';

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

export const increaseIngredientQuantity = async (
	playerId: string | null,
	ingredientId: number,
	quantity: number,
	tx: TxClient = prisma
) => {
	if (!playerId) {
		throw new ExpectedError(`No playerId for increaseIngredientQuantity`);
	}
	const ingredient = await tx.playerIngredient.upsert({
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
export const consumeIngredient = async (
	playerId: string,
	ingredientId: number,
	quantity: number,
	tx: TxClient = prisma
): Promise<boolean> => {
	if (!Number.isInteger(quantity) || quantity <= 0) {
		return false;
	}
	const updated = await tx.playerIngredient.updateMany({
		where: { ingredientId, playerId, quantity: { gte: quantity } },
		data: { quantity: { decrement: quantity } }
	});

	if (updated.count === 0) {
		return false;
	}

	await tx.playerIngredient.deleteMany({ where: { ingredientId, playerId, quantity: { lte: 0 } } });

	return true;
};

/** Thrown by `consumeIngredientLines` to roll its transaction back when a line is missing. */
export class NotEnoughIngredients extends ExpectedError {}

/**
 * Removes several ingredient lines at once, inside the caller's transaction. Throws `NotEnoughIngredients` when
 * one line is missing, so the transaction is rolled back and nothing the caller grants in exchange is written.
 */
export async function consumeIngredientLines(
	playerId: string,
	lines: { ingredientId: number; quantity: number }[],
	tx: TxClient
) {
	for (const line of lines) {
		if (!(await consumeIngredient(playerId, line.ingredientId, line.quantity, tx))) {
			throw new NotEnoughIngredients('notEnoughIngredients');
		}
	}
}

/**
 * Sells ingredients to a merchant in one transaction: the ingredients are removed by conditional writes before
 * the gold is credited, so a missing line credits nothing.
 * @returns `false` if the player no longer has one of the lines
 */
export async function sellIngredients(
	playerId: string,
	lines: { ingredientId: number; quantity: number }[],
	gold: number
): Promise<boolean> {
	try {
		await prisma.$transaction(async tx => {
			await consumeIngredientLines(playerId, lines, tx);
			await tx.player.update({ where: { id: playerId }, data: { money: { increment: gold } } });
		});
		return true;
	} catch (err) {
		if (err instanceof NotEnoughIngredients) return false;
		throw err;
	}
}
