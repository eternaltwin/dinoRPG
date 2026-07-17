import { prisma } from "../prisma.js";
import { withSpan } from "../utils/server/tracing.js";

/**
 * Get all the necessary data from the player for to handle pulling get data from the demon shop.
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
				// demonShop: {
				// 	select: {
				// 		id: true,
				// 		raceId: true,
				// 		display: true
				// 	}
				// },
                dinoz: {
                    select: {
                        level: true,
                        id: true,
                        life: true,
                        placeId: true,
                        status: true,
                        missions: true,
                        items: true,
                        skills: true,
                        unavailableReason: true
                    }
                },
                items : {
                    select: {
                        itemId: true,
                        quantity: true,
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