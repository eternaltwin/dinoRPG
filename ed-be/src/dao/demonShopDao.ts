import { Prisma, UnavailableReason } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { withSpan } from '../utils/server/tracing.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';

// Paged so a player who has sacrificed hundreds of Dinoz over time doesn't pull them all in one query.
export const SACRIFICED_DINOZ_PAGE_SIZE = 20;

/**
 * Get all the necessary data from the player for to handle pulling data from the demon shop.
 * That includes notably the minimum needed to process conditions.
 * Throws an error if the player does not exist.
 * @return Player
 */
export async function getPlayerDemonShopRequest(playerId: string) {
	return withSpan(getPlayerDemonShopRequest.name, async () => {
		const player = await prisma.player.findUnique({
			where: {
				id: playerId
			},
			select: {
				id: true,
				engineer: true,
				demonShop: {
					select: {
						id: true,
						raceId: true,
						display: true,
						nbrUpFire: true,
						nbrUpWood: true,
						nbrUpWater: true,
						nbrUpLightning: true,
						nbrUpAir: true,
						skills: true,
						unlockableSkills: true,
						seed: true,
						nextUpElementId: true,
						nextUpAltElementId: true
					}
				},
				dinoz: {
					// Sacrificed Dinoz are fetched separately and paginated, see getSacrificedDinozRequest.
					// (placeId alone isn't enough: sacrificed Dinoz never leave CIMETIERE, so they'd still
					// be pulled here unbounded without also excluding unavailableReason=sacrificed.)
					where: {
						AND: [
							{ placeId: PlaceEnum.CIMETIERE },
							{ OR: [{ unavailableReason: { not: UnavailableReason.sacrificed } }, { unavailableReason: null }] }
						]
					},
					select: {
						level: true,
						id: true,
						raceId: true,
						life: true,
						display: true,
						placeId: true,
						status: true,
						items: true,
						missions: true,
						skills: true,
						unavailableReason: true,
						nbrUpFire: true,
						nbrUpWood: true,
						nbrUpWater: true,
						nbrUpLightning: true,
						nbrUpAir: true
					}
				},
				items: {
					select: {
						itemId: true,
						quantity: true
					}
				},
				quests: true,
				quetzuBought: true,
				ranking: true,
				rewards: true
			}
		});

		return player;
	});
}

/**
 * Get one page of a player's sacrificed Dinoz, ordered by id ascending.
 * @return Dinoz[]
 */
export async function getSacrificedDinozRequest(playerId: string, page: number) {
	return withSpan(getSacrificedDinozRequest.name, async () => {
		return prisma.dinoz.findMany({
			where: {
				playerId,
				unavailableReason: UnavailableReason.sacrificed
			},
			select: {
				id: true,
				level: true,
				display: true,
				raceId: true,
				nbrUpFire: true,
				nbrUpWood: true,
				nbrUpWater: true,
				nbrUpLightning: true,
				nbrUpAir: true,
				skills: true
			},
			orderBy: { id: 'asc' },
			skip: (page - 1) * SACRIFICED_DINOZ_PAGE_SIZE,
			take: SACRIFICED_DINOZ_PAGE_SIZE
		});
	});
}

/**
 * Get all the necessary data from the player for to handle sacrifice of the Dinoz.
 * Throws an error if the dinoz does not exist.
 * @return Player
 */
export async function getDinozDataForSacrificeRequest(dinozId: number) {
	return withSpan(getDinozDataForSacrificeRequest.name, async () => {
		const dinoz = await prisma.dinoz.findUnique({
			where: {
				id: dinozId
			},
			select: {
				id: true,
				placeId: true,
				level: true,
				status: true,
				items: true,
				unavailableReason: true,
				player: {
					select: {
						id: true,
						rewards: true,
						items: true
					}
				}
			}
		});

		return dinoz;
	});
}

/**
 * Get all the necessary data from the player for to handle unsacrifice of the Dinoz.
 * Throws an error if the dinoz does not exist.
 * @return Player
 */
export async function getDinozDataForUnsacrificeRequest(dinozId: number) {
	return withSpan(getDinozDataForUnsacrificeRequest.name, async () => {
		const dinoz = await prisma.dinoz.findUnique({
			where: {
				id: dinozId
			},
			select: {
				id: true,
				placeId: true,
				level: true,
				items: true,
				unavailableReason: true,
				player: {
					select: {
						id: true,
						rewards: true,
						items: true
					}
				}
			}
		});

		return dinoz;
	});
}

/**
 * Get all the existing data from the player demon shop.
 * @return Player
 */
export async function getDinozFromDemonShopRequest(playerId: string) {
	return withSpan(getDinozFromDemonShopRequest.name, async () => {
		const dinozShop = await prisma.playerDemonShop.findMany({
			where: {
				playerId
			},
			select: {
				id: true,
				display: true,
				raceId: true,
				nbrUpFire: true,
				nbrUpWood: true,
				nbrUpWater: true,
				nbrUpLightning: true,
				nbrUpAir: true,
				player: true,
				skills: true,
				unlockableSkills: true
			}
		});

		return dinozShop;
	});
}

export async function createMultipleDemonDinoz(dinozArray: Prisma.PlayerDemonShopCreateManyInput[]) {
	return withSpan(createMultipleDemonDinoz.name, async () => {
		const promises = [];

		for (const dinoz of dinozArray) {
			promises.push(prisma.playerDemonShop.create({ data: dinoz }));
		}

		return Promise.all(promises);
	});
}

export async function deleteDinozInDemonShopRequest(playerId: string) {
	return withSpan(deleteDinozInDemonShopRequest.name, async () => {
		await prisma.playerDemonShop.deleteMany({
			where: {
				playerId
			}
		});
	});
}
