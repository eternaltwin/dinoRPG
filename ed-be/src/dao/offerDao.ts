import { MARKET_OFFER_DURATION, MARKET_OFFER_DURATION_DEBUG } from '@drpg/core/constants';
import { OfferStatus, Prisma, Offer, UnavailableReason } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { OfferFromGetOffers } from '@drpg/core/returnTypes/Offer';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import OfferOrderByWithRelationInput = Prisma.OfferOrderByWithRelationInput;
import { GLOBAL } from '../context.js';

export async function getOffers(
	userId: string | null,
	filter: string,
	sellerId: string | null,
	bidderId: string | null,
	expired: boolean,
	page: number
): Promise<{ total: number; offers: OfferFromGetOffers[] }> {
	const where: Prisma.OfferWhereInput = {};
	const pageSize = 10;
	let orderBy: OfferOrderByWithRelationInput;

	if (filter === 'dinoz') {
		where.dinoz = { isNot: null };
	} else if (filter === 'items') {
		where.items = { some: {} };
	} else if (filter === 'own') {
		if (!userId) {
			throw new ExpectedError('missingUser');
		}

		where.OR = [{ sellerId: userId }, { bids: { some: { userId } } }];
	}

	if (sellerId) {
		where.sellerId = sellerId;
	}

	if (bidderId) {
		where.bids = { some: { userId: bidderId } };
	}

	if (expired) {
		where.OR = [{ status: OfferStatus.ENDED }, { status: OfferStatus.CLAIMED }];
		orderBy = { id: 'desc' };
	} else {
		where.status = OfferStatus.ONGOING;
		orderBy = { endDate: 'asc' };
	}

	const totalOffers = await prisma.offer.count({ where });

	const offers = await prisma.offer.findMany({
		where,
		skip: (page - 1) * pageSize,
		take: pageSize,
		include: {
			seller: { select: { id: true, name: true } },
			dinoz: {
				select: {
					id: true,
					display: true,
					name: true,
					level: true,
					raceId: true,
					nbrUpFire: true,
					nbrUpWater: true,
					nbrUpLightning: true,
					nbrUpWood: true,
					nbrUpAir: true,
					status: { select: { statusId: true } },
					skills: { select: { skillId: true }, orderBy: { skillId: 'asc' } }
				}
			},
			items: { select: { itemId: true, quantity: true, isIngredient: true } },
			bids: {
				select: {
					value: true,
					user: { select: { id: true, name: true } }
				},
				orderBy: { value: 'desc' },
				take: 1
			}
		},
		orderBy
	});

	return { total: totalOffers, offers };
}

export async function insertOffer(
	dinozId: number | null,
	total: number,
	itemsAndIngredient: {
		itemId: number;
		quantity: number;
		isIngredient: boolean;
	}[],
	playerId: string
) {
	const duration = GLOBAL.config.isProduction ? MARKET_OFFER_DURATION : MARKET_OFFER_DURATION_DEBUG;
	const playerName = await prisma.player.findUniqueOrThrow({
		where: {
			id: playerId
		},
		select: {
			name: true
		}
	});
	return prisma.offer.create({
		data: {
			sellerId: playerId,
			sellerName: playerName.name,
			endDate: new Date(Date.now() + duration),
			dinozId,
			items: {
				create: itemsAndIngredient
			},
			total
		}
	});
}

export async function deleteOffer(offerId: number) {
	// Delete offer items
	await prisma.offerItem.deleteMany({
		where: {
			offerId
		}
	});

	// Delete offer bids
	await prisma.offerBid.deleteMany({
		where: {
			offerId
		}
	});

	// Delete offer
	await prisma.offer.delete({
		where: {
			id: offerId
		}
	});
}

export async function getOffer(offerId: number, status: OfferStatus) {
	const offer = await prisma.offer.findUnique({
		where: {
			id: offerId,
			status: status
		},
		include: {
			seller: { select: { id: true, name: true } },
			dinoz: {
				select: {
					id: true,
					name: true,
					level: true,
					raceId: true,
					nbrUpAir: true,
					nbrUpFire: true,
					nbrUpLightning: true,
					nbrUpWater: true,
					nbrUpWood: true,
					display: true,
					playerId: true,
					status: { select: { statusId: true } },
					skills: { select: { skillId: true } }
				}
			},
			items: { select: { itemId: true, quantity: true, isIngredient: true } },
			bids: {
				select: { userId: true, value: true },
				orderBy: { value: 'asc' }
			}
		}
	});

	return offer;
}

export async function prepareRefund(playerId: string, ingredientList: number[], itemList: number[]) {
	const player = await prisma.player.findUniqueOrThrow({
		where: {
			id: playerId
		},
		select: {
			id: true,
			name: true,
			shopKeeper: true,
			leader: true,
			messie: true,
			ingredients: {
				where: {
					ingredientId: { in: ingredientList }
				},
				select: {
					ingredientId: true,
					quantity: true
				}
			},
			items: {
				where: {
					itemId: { in: itemList }
				}
			},
			_count: {
				select: {
					dinoz: {
						where: {
							OR: [
								{ unavailableReason: null },
								{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
							]
						}
					}
				}
			}
		}
	});
	return player;
}

export async function addBid(offerId: number, userId: string, value: number) {
	await prisma.offerBid.create({
		data: {
			offerId,
			userId,
			value
		}
	});
}

export async function updateOfferStatus(offerId: number, status: OfferStatus) {
	await prisma.offer.update({
		where: {
			id: offerId
		},
		data: {
			status
		}
	});
}

export async function updateOfferDinoz(offerId: number, dinozDetail: string) {
	await prisma.offer.update({
		where: {
			id: offerId
		},
		data: {
			dinozDetails: dinozDetail
		}
	});
}

export async function extendTimer(offer: Pick<Offer, 'id' | 'endDate'>) {
	// Ajoute 30 secondes à l'endDate
	const newEndDate = new Date(offer.endDate.getTime() + 30 * 1000);

	// Met à jour l'endDate avec la nouvelle date
	return await prisma.offer.update({
		where: { id: offer.id },
		data: { endDate: newEndDate }
	});
}

export async function getOngoingOffers() {
	const offers = await prisma.offer.findMany({
		where: {
			status: OfferStatus.ONGOING
		}
	});

	return offers;
}
