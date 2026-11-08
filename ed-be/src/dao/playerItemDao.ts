import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import type { TxClient } from './transaction.js';

export const increaseItemQuantity = async (
	playerId: string | null,
	itemId: number,
	quantity: number,
	tx: TxClient = prisma
) => {
	if (!playerId) {
		throw new ExpectedError(`No playerId for increaseItemQuantity`);
	}
	const item = await tx.playerItem.upsert({
		where: {
			itemId_playerId: {
				itemId,
				playerId
			}
		},
		create: {
			itemId,
			playerId,
			quantity
		},
		update: {
			quantity: {
				increment: quantity
			}
		}
	});

	return item;
};

export const decreaseItemQuantity = async (playerId: string, itemId: number, quantity: number) => {
	const item = await prisma.playerItem.update({
		where: {
			itemId_playerId: {
				itemId,
				playerId
			}
		},
		data: {
			quantity: {
				decrement: quantity
			}
		}
	});

	// Delete item if quantity is <= 0
	if (item.quantity <= 0) {
		await prisma.playerItem.delete({
			where: {
				itemId_playerId: {
					itemId,
					playerId
				}
			}
		});
	}
};

/**
 * Remove items from a player only if they own enough of them. The check and the write are a single
 * statement, so concurrent requests can't spend the same items twice.
 * @returns `true` if the items were removed, `false` if the player does not have enough
 */
export const consumeItem = async (
	playerId: string,
	itemId: number,
	quantity: number,
	tx: TxClient = prisma
): Promise<boolean> => {
	if (!Number.isInteger(quantity) || quantity <= 0) {
		return false;
	}
	const updated = await tx.playerItem.updateMany({
		where: { itemId, playerId, quantity: { gte: quantity } },
		data: { quantity: { decrement: quantity } }
	});

	if (updated.count === 0) {
		return false;
	}

	await tx.playerItem.deleteMany({ where: { itemId, playerId, quantity: { lte: 0 } } });

	return true;
};

export async function insertItem(playerId: string, newItem: Prisma.PlayerItemCreateInput) {
	return prisma.playerItem.create({
		data: {
			...newItem,
			player: { connect: { id: playerId } }
		}
	});
}

export async function getPlayerItems(playerId: string, where?: Prisma.PlayerItemWhereInput) {
	return prisma.playerItem.findMany({
		where: {
			playerId,
			...where
		},
		select: {
			itemId: true,
			quantity: true
		}
	});
}

export async function setMultipleItem(item: Prisma.PlayerItemCreateManyInput[]) {
	await prisma.playerItem.createMany({
		data: item
	});
}
