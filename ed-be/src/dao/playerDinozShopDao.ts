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

/**
 * Empty the player's dinoz shop if it still offers the given dinoz, which reserves that purchase. It is a single
 * statement: a concurrent purchase waits on the row locks, then finds nothing left to delete and is refused.
 * @returns `true` if the shop was claimed, `false` if the offer is gone
 */
export async function claimDinozShop(playerId: string, dinozId: number): Promise<boolean> {
	return withSpan(claimDinozShop.name, async () => {
		const deleted = await prisma.$executeRaw`
			DELETE FROM player_dinoz_shop
			WHERE "playerId" = ${playerId}::uuid
				AND EXISTS (SELECT 1 FROM player_dinoz_shop WHERE id = ${dinozId} AND "playerId" = ${playerId}::uuid)
		`;

		return deleted > 0;
	});
}
