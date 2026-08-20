import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { withSpan } from '../utils/server/tracing.js';

export async function getDinozFromDinozShopRequest(playerId: string) {
	return withSpan(getDinozFromDinozShopRequest.name, async () => {
		const dinozShop = await prisma.playerDinozShop.findMany({
			where: {
				playerId
			},
			select: {
				display: true,
				player: true
			}
		});

		return dinozShop;
	});
}

export async function createMultipleDinoz(dinozArray: Prisma.PlayerDinozShopCreateManyInput[]) {
	return withSpan(createMultipleDinoz.name, async () => {
		const promises = [];

		for (const dinoz of dinozArray) {
			promises.push(prisma.playerDinozShop.create({ data: dinoz }));
		}

		return Promise.all(promises);
	});
}

export async function getDinozShopDetailsRequest(dinozId: number) {
	return withSpan(getDinozShopDetailsRequest.name, async () => {
		const dinozShop = await prisma.playerDinozShop.findUnique({
			where: {
				id: dinozId
			},
			select: {
				display: true,
				raceId: true,
				id: true,
				player: {
					select: {
						id: true,
						money: true,
						ranking: {
							select: {
								id: true,
								dinozCount: true,
								points: true,
								average: true
							}
						}
					}
				}
			}
		});

		return dinozShop;
	});
}

export async function deleteDinozInShopRequest(playerId: string) {
	return withSpan(deleteDinozInShopRequest.name, async () => {
		await prisma.playerDinozShop.deleteMany({
			where: {
				playerId
			}
		});
	});
}
