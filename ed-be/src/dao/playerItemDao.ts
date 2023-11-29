import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';

export const increaseItemQuantity = async (playerId: number, itemId: number, quantity: number) => {
	const item = await prisma.playerItem.upsert({
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

export const decreaseItemQuantity = async (playerId: number, itemId: number, quantity: number) => {
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

export async function insertItem(playerId: number, newItem: Prisma.PlayerItemCreateInput) {
	return prisma.playerItem.create({
		data: {
			...newItem,
			player: { connect: { id: playerId } }
		}
	});
}

export async function getPlayerItems(playerId: number, where?: Prisma.PlayerItemWhereInput) {
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
