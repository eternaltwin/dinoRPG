import { MARKET_OFFER_DURATION, MARKET_OFFER_DURATION_DEBUG } from '@drpg/core/constants';
import { Offer, OfferStatus, Prisma, UnavailableReason } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { OfferFromGetOffers } from '@drpg/core/returnTypes/Offer';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { GLOBAL } from '../context.js';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { consumeItem, increaseItemQuantity } from './playerItemDao.js';
import { consumeIngredient, increaseIngredientQuantity } from './playerIngredientDao.js';
import type { TxClient } from './transaction.js';
import OfferOrderByWithRelationInput = Prisma.OfferOrderByWithRelationInput;

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
					skills: { select: { skillId: true } }
				}
			},
			items: { select: { itemId: true, quantity: true, isIngredient: true } },
			bids: {
				select: {
					value: true,
					user: { select: { id: true, name: true } },
					userId: true
				},
				orderBy: { value: 'desc' },
				take: 1
			}
		},
		orderBy
	});

	return { total: totalOffers, offers };
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

/** Moves an ENDED offer to CLAIMED; false when another call already did, so it is settled only once. */
export async function claimEndedOffer(offerId: number) {
	const { count } = await prisma.offer.updateMany({
		where: { id: offerId, status: OfferStatus.ENDED },
		data: { status: OfferStatus.CLAIMED }
	});
	return count === 1;
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

export async function getOngoingOffers() {
	const offers = await prisma.offer.findMany({
		where: {
			status: OfferStatus.ONGOING
		}
	});

	return offers;
}

export type getEndedOffersType = Awaited<ReturnType<typeof getEndedOffers>>;
export async function getEndedOffers() {
	const offers = await prisma.offer.findMany({
		where: {
			status: OfferStatus.ENDED
		},
		include: {
			items: true,
			bids: true
		}
	});

	return offers;
}

/** A line of an offer: an item or an ingredient and its quantity. */
export type OfferLine = { itemId: number; quantity: number; isIngredient: boolean };

/** A market write refused inside its transaction, rolled back; `reason` is a translation key. */
export type MarketRefusal = { refused: string };

class Refusal extends Error {
	constructor(readonly reason: string) {
		super(reason);
	}
}

async function refusable<T>(fn: (tx: TxClient) => Promise<T>): Promise<T | MarketRefusal> {
	try {
		return await prisma.$transaction(fn);
	} catch (err) {
		if (err instanceof Refusal) return { refused: err.reason };
		throw err;
	}
}

/**
 * Puts the content on sale and creates the offer in one transaction. Items and ingredients are removed by
 * conditional writes and the dinoz is locked only while it is still available: a concurrent request (a second
 * offer, a use of the same items) makes this one fail instead of taking the player below zero.
 */
export async function createOfferWithStock(
	dinozId: number | null,
	total: number,
	lines: OfferLine[],
	playerId: string
): Promise<Offer | MarketRefusal> {
	const duration = GLOBAL.config.isProduction ? MARKET_OFFER_DURATION : MARKET_OFFER_DURATION_DEBUG;
	return refusable(async tx => {
		for (const line of lines) {
			const removed = line.isIngredient
				? await consumeIngredient(playerId, line.itemId, line.quantity, tx)
				: await consumeItem(playerId, line.itemId, line.quantity, tx);
			if (!removed) throw new Refusal(line.isIngredient ? 'notEnoughIngredients' : 'notEnoughItems');
		}
		if (dinozId) {
			const { count } = await tx.dinoz.updateMany({
				where: { id: dinozId, playerId, unavailableReason: null },
				data: { unavailableReason: UnavailableReason.selling }
			});
			if (count !== 1) throw new Refusal('error.dinozNotAvailable');
		}
		const { name } = await tx.player.findUniqueOrThrow({ where: { id: playerId }, select: { name: true } });
		return tx.offer.create({
			data: {
				sellerId: playerId,
				sellerName: name,
				endDate: new Date(Date.now() + duration),
				dinozId,
				items: { create: lines },
				total
			}
		});
	});
}

/**
 * Cancels an ongoing offer without bid and gives its content back to the seller, in one transaction. Only
 * the call that still finds the offer ongoing, without bid and owned by the seller gets through.
 * @returns `false` if the offer was cancelled, ended or bid on meanwhile
 */
export async function cancelOngoingOffer(
	offer: Pick<Offer, 'id' | 'dinozId'> & { items: OfferLine[] },
	sellerId: string
): Promise<boolean> {
	const result = await refusable(async tx => {
		const { count } = await tx.offer.updateMany({
			where: { id: offer.id, sellerId, status: OfferStatus.ONGOING, bids: { none: {} } },
			data: { status: OfferStatus.CLAIMED }
		});
		if (count !== 1) throw new Refusal('invalidOffer');
		for (const line of offer.items) {
			if (line.isIngredient) await increaseIngredientQuantity(sellerId, line.itemId, line.quantity, tx);
			else await increaseItemQuantity(sellerId, line.itemId, line.quantity, tx);
		}
		if (offer.dinozId) {
			await tx.dinoz.updateMany({
				where: { id: offer.dinozId, unavailableReason: UnavailableReason.selling },
				data: { unavailableReason: null }
			});
		}
		await tx.offerItem.deleteMany({ where: { offerId: offer.id } });
		await tx.offer.delete({ where: { id: offer.id } });
		return true;
	});
	return result === true;
}

/**
 * Places a bid in one transaction, with the offer row locked: the leading bid is read again under the lock,
 * the previous leader is repaid, then the coupons of the bidder are taken by a conditional write. Concurrent
 * bids are thus played one after the other, each against the bid that really leads.
 * @returns the new end of the offer, or the reason of the refusal
 */
export async function placeBid(
	offerId: number,
	bidder: { id: string; name: string },
	value: number
): Promise<{ endDate: Date } | MarketRefusal> {
	return refusable(async tx => {
		const locked = await tx.$queryRaw<
			{ id: number; status: string; endDate: Date; total: number; sellerId: string | null }[]
		>`
			SELECT id, status::text AS status, "endDate", total, "sellerId" FROM "Offer" WHERE id = ${offerId} FOR UPDATE`;
		const offer = locked[0];
		if (!offer || offer.status !== OfferStatus.ONGOING || !offer.sellerId || offer.sellerId === bidder.id) {
			throw new Refusal('invalidOffer');
		}
		if (offer.endDate.getTime() <= Date.now()) throw new Refusal('invalidOffer');

		const leading = await tx.offerBid.findFirst({ where: { offerId }, orderBy: { value: 'desc' } });
		const previousOwnBid = leading?.userId === bidder.id ? leading.value : 0;
		if (!Number.isInteger(value) || value <= previousOwnBid || value < offer.total / 1000) {
			throw new Refusal('bidIsLower');
		}
		if (leading && value < leading.value + 1) throw new Refusal('bidIsLower');

		// Repay the previous leader (the bidder themself when raising their own bid), then take the new bid
		if (leading?.userId) {
			await increaseItemQuantity(leading.userId, itemList[Item.TREASURE_COUPON].itemId, leading.value, tx);
		}
		if (!(await consumeItem(bidder.id, itemList[Item.TREASURE_COUPON].itemId, value, tx))) {
			throw new Refusal('notEnoughTickets');
		}

		await tx.offerBid.create({ data: { offerId, userId: bidder.id, value, userName: bidder.name } });
		// Each bid adds 30 seconds to the offer
		const endDate = new Date(offer.endDate.getTime() + 30 * 1000);
		await tx.offer.update({ where: { id: offerId }, data: { endDate } });
		return { endDate };
	});
}

/**
 * Moves an ONGOING offer to ENDED once its end is reached. A bid that extended the offer meanwhile, or another
 * expiration, makes it match nothing.
 * @returns `true` if this call ended the offer
 */
export async function endOngoingOffer(offerId: number): Promise<boolean> {
	const { count } = await prisma.offer.updateMany({
		// One second of tolerance: the job may fire a few milliseconds before the end date
		where: { id: offerId, status: OfferStatus.ONGOING, endDate: { lte: new Date(Date.now() + 1000) } },
		data: { status: OfferStatus.ENDED }
	});
	return count === 1;
}
