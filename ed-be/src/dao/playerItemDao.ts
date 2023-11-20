import { Prisma } from "@drpg/prisma";
import { prisma } from "../prisma.js";

export const increaseItemQuantity = async (playerId: number, itemId: number, quantity: number) => {
	const item = await prisma.playerItem.update({
		where: {
			itemId_playerId: {
				itemId,
				playerId
			}
		},
		data: {
			quantity: {
				increment: quantity
			}
		}
	});

	return item;
}

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

	return item;
}

export async function insertItem(playerId: number, newItem: Prisma.PlayerItemCreateInput) {
	return prisma.playerItem.create({
		data: {
			...newItem,
			player: { connect: { id: playerId } }
		}
	});
}

export async function getPlayerItems(playerId: number) {
	return prisma.playerItem.findMany({
		where: {
			playerId
		},
		select: {
			itemId: true,
		}
	});
}

export async function setMultipleItem(item: Prisma.PlayerItemCreateManyInput[]) {
	await prisma.playerItem.createMany({
		data: item
	});
}
