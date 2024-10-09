import { MARKET_OFFER_DURATION, MARKET_OFFER_DURATION_DEBUG } from '@drpg/core/constants';
import { OfferStatus, Prisma, Offer } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { OfferFromGetOffers } from '@drpg/core/returnTypes/Offer';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

export async function getOffers(
	userId: number | null,
	filter: string,
	sellerId: number | null,
	bidderId: number | null,
	expired: boolean,
	page: number
): Promise<OfferFromGetOffers[]> {
	const where: Prisma.OfferWhereInput = {};
	const pageSize = 10;

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
		where.status = OfferStatus.ENDED;
	} else {
		where.status = OfferStatus.ONGOING;
	}

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
				orderBy: { value: 'asc' }
			}
		},
		orderBy: {
			id: 'desc'
		}
	});

	return offers;
}

export async function totalOffers() {
	return await prisma.offer.count({});
}

export async function insertOffer(
	dinozId: number | null,
	total: number,
	itemsAndIngredient: {
		itemId: number;
		quantity: number;
		isIngredient: boolean;
	}[],
	playerId: number
) {
	return prisma.offer.create({
		data: {
			sellerId: playerId,
			endDate: new Date(Date.now() + MARKET_OFFER_DURATION),
			// endDate: new Date(Date.now() + MARKET_OFFER_DURATION_DEBUG),
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

export async function getOffer(offerId: number) {
	const offer = await prisma.offer.findUnique({
		where: {
			id: offerId,
			status: OfferStatus.ONGOING
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

export async function addBid(offerId: number, userId: number, value: number) {
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
