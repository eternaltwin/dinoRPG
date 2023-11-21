import { MARKET_OFFER_DURATION } from "@drpg/core/constants";
import { Prisma } from "@drpg/prisma";
import { prisma } from "../prisma.js";
import { OfferFromGetOffers } from "@drpg/core/returnTypes/Offer";

export async function getOffers(
	userId: number,
	filter: string,
	sellerId: number | null,
	bidderId: number | null,
	expired: boolean
): Promise<OfferFromGetOffers[]> {
	const where: Prisma.OfferWhereInput = {};

	if (filter === 'dinoz') {
		where.dinoz = { isNot: null };
	} else if (filter === 'items') {
		where.items = { some: {} };
	} else if (filter === 'own') {
		where.OR = [
			{ sellerId: userId },
			{ bids: { some: { userId } } }
		];
	}

	if (sellerId) {
		where.sellerId = sellerId;
	}

	if (bidderId) {
		where.bids = { some: { userId: bidderId } };
	}

	if (expired) {
		where.endDate = { lte: new Date() };
	} else {
		where.endDate = { gt: new Date() };
	}

	const offers = await prisma.offer.findMany({
		where,
		include: {
			seller: { select: { id: true, name: true } },
			dinoz: { select: { id: true, name: true } },
			items: { select: { itemId: true, quantity: true, isIngredient: true } },
			bids: {
				select: { userId: true, value: true },
				orderBy: { value: 'desc' }
			},
		}
	});

	return offers;
}

export async function insertOffer(
	dinozId: number | null,
	total: number,
	itemsAndIngredient: {
		itemId: number;
		quantity: number;
		isIngredient: boolean
	}[],
	playerId: number,
) {
	return prisma.offer.create({
		data: {
			sellerId: playerId,
			endDate: new Date(Date.now() + MARKET_OFFER_DURATION),
			dinozId,
			items: {
				create: itemsAndIngredient
			},
			total,
		}
	});
}

export async function deleteOffer(offerId: number) {
	await prisma.offer.delete({
		where: {
			id: offerId
		}
	});
}

export async function getOffer(offerId: number) {
	const offer = await prisma.offer.findUnique({
		where: {
			id: offerId
		},
		include: {
			seller: { select: { id: true, name: true } },
			dinoz: { select: { id: true, name: true } },
			items: { select: { itemId: true, quantity: true, isIngredient: true } },
			bids: {
				select: { userId: true, value: true },
				orderBy: { value: 'desc' }
			},
		}
	});

	return offer;
}

export async function addBid(offerId: number, userId: number, value: number) {
	await prisma.offerBid.create({
		data: {
			offerId,
			userId,
			value,
		}
	});
}
