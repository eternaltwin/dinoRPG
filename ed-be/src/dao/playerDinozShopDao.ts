import { Prisma } from "@drpg/prisma";
import { prisma } from "../prisma.js";

export async function getDinozFromDinozShopRequest(playerId: number) {
	const dinozShop = await prisma.playerDinozShop.findMany({
		where: {
			playerId
		},
		select: {
			display: true,
			player: true,
		}
	});

	return dinozShop;
}

export async function createMultipleDinoz(dinozArray: Prisma.PlayerDinozShopCreateManyInput[]) {
	const promises = [];

	for (const dinoz of dinozArray) {
		promises.push(prisma.playerDinozShop.create({ data: dinoz }));
	}

	return Promise.all(promises);
}

export async function getDinozShopDetailsRequest(dinozId: number) {
	const dinozShop = await prisma.playerDinozShop.findUnique({
		where: {
			id: dinozId
		},
		select: {
			display: true,
			raceId: true,
			id: true,
			player: { select: {
				id: true,
				money: true,
				ranking: { select: {
					id: true,
					dinozCount: true,
					sumPointsDisplayed: true,
					sumPoints: true,
					averagePoints: true,
					averagePointsDisplayed: true
				} }
			} }
		}
	});

	return dinozShop;
}

export async function deleteDinozInShopRequest(playerId: number) {
	await prisma.playerDinozShop.deleteMany({
		where: {
			playerId
		}
	});
}
