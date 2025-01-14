import { Request } from 'express';
import {
	addBid,
	deleteOffer,
	extendTimer,
	getOffer,
	getOffers,
	getOngoingOffers,
	insertOffer,
	prepareRefund,
	updateOfferDinoz,
	updateOfferStatus
} from '../dao/offerDao.js';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { getDinozEquipItemRequest, getDinozPlace, updateDinoz } from '../dao/dinozDao.js';
import { decreaseItemQuantity, getPlayerItems, increaseItemQuantity } from '../dao/playerItemDao.js';
import {
	decreaseIngredientQuantity,
	getAllIngredientsDataRequest,
	increaseIngredientQuantity
} from '../dao/playerIngredientDao.js';
import { $Enums, Dinoz, LogType, OfferStatus, UnavailableReason } from '@drpg/prisma';
import { scheduleJob, scheduledJobs } from 'node-schedule';
import { addMoney, auth, ownsDinoz } from '../dao/playerDao.js';
import { updateDinozCount, updatePoints } from '../dao/rankingDao.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { setSpecificStat } from '../dao/trackingDao.js';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { LOGGER } from '../context.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';
import { createLog } from '../dao/logDao.js';
import gameConfig from '../config/game.config.js';
import { createNotification } from '../dao/notificationDao.js';
import NotificationSeverity = $Enums.NotificationSeverity;

/**
 * Get the list of current offers
 */
export async function getOfferList(req: Request) {
	const authed = await auth(req);

	const filter = req.params.filter;
	const sellerId = req.query.sellerId ? (req.query.sellerId as string) : null;
	const bidderId = req.query.bidderId ? (req.query.bidderId as string) : null;
	const expired = req.query.expired ? req.query.expired === 'true' : false;
	const page = req.query.page ? +req.query.page : 1;
	const onlyMines = req.query.onlyMines ? req.query.onlyMines === 'true' : false;

	// Get filtered offers
	let { total, offers } = await getOffers(authed.id, filter, sellerId, bidderId, expired, page);

	if (onlyMines) {
		offers = offers
			.filter(o => {
				if (o.bids[0]) {
					return o.bids[0].user.id === authed.id;
				} else {
					return o.sellerId === authed.id;
				}
			})
			.filter(o => o.status === OfferStatus.ENDED);
	}

	if (expired) {
		offers.map(o => {
			if (o.dinozDetails) {
				o.dinoz = JSON.parse(o.dinozDetails);
			} else {
				o.dinoz = null;
			}
		});
	}
	return { total, offers };
}

/**
 * Create a new offer
 */
export async function createOffer(req: Request) {
	// Check if player is logged in
	const authed = await auth(req);

	const dinozId = req.body.dinoz ? +req.body.dinoz : null;
	const total = +req.body.total;
	const ingredients = req.body.ingredients as {
		name: string;
		count: number;
	}[];
	const items = req.body.items as {
		name: string;
		count: number;
	}[];

	const { offers } = await getOffers(authed.id, 'own', authed.id, null, false, 1);

	if (offers.length > 0) {
		throw new ExpectedError(translate('alreadyOffer', authed));
	}

	if (dinozId) {
		// Check if player owns the Dinoz
		const owns = await ownsDinoz(authed.id, dinozId);

		if (!owns) {
			throw new ExpectedError(translate('invalidDinoz', authed));
		}

		const dinozPlace = await getDinozPlace(dinozId);
		if (dinozPlace && dinozPlace.placeId !== PlaceEnum.PLACE_DU_MARCHE) {
			throw new ExpectedError('Dinoz is not at the right place to do this.');
		}
		const dinozItems = await getDinozEquipItemRequest(dinozId);
		if (dinozItems && dinozItems.items.length >= 1) {
			throw new ExpectedError(translate('equipedItems', authed));
		}
	}

	// Group items and ingredients
	const itemsAndIngredients = [];

	itemsAndIngredients.push(
		...ingredients.map(ingredient => {
			const ingredientData = Object.entries(ingredientList).find(ing => ing[0] === ingredient.name.toLocaleUpperCase());

			if (!ingredientData) {
				throw new ExpectedError('Ingredient not found');
			}

			return {
				itemId: ingredientData[1].ingredientId,
				quantity: ingredient.count,
				isIngredient: true
			};
		}),
		...items.map(item => {
			const itemData = Object.entries(itemList).find(i => i[1].name === item.name.toLowerCase());

			if (!itemData) {
				throw new ExpectedError('Item not found');
			}
			if (itemData[1].sellable === false) {
				throw new ExpectedError(`Item ${itemData[0]} cannot be sold`);
			}

			return {
				itemId: itemData[1].itemId,
				quantity: item.count,
				isIngredient: false
			};
		})
	);

	// Get available items and ingredients
	const availableItems = await getPlayerItems(authed.id);
	const availableIngredients = await getAllIngredientsDataRequest(authed.id);
	// Check if user has enough items and ingredients
	for (const item of itemsAndIngredients) {
		if (item.isIngredient) {
			const availableIngredient = availableIngredients.find(
				availableIngredient => availableIngredient.ingredientId === item.itemId
			);

			if (!availableIngredient || availableIngredient.quantity < item.quantity) {
				throw new ExpectedError(translate('notEnoughIngredients', authed));
			}
		} else {
			const availableItem = availableItems.find(availableItem => availableItem.itemId === item.itemId);

			if (!availableItem || availableItem.quantity < item.quantity) {
				throw new ExpectedError(translate('notEnoughItems', authed));
			}
		}
	}

	// Insert offer
	const offer = await insertOffer(dinozId, total, itemsAndIngredients, authed.id);
	await createLog(LogType.OfferNew, authed.id, undefined, offer.id, offer.total);

	// Set Dinoz as selling
	if (dinozId) {
		updateDinoz(dinozId, { unavailableReason: UnavailableReason.selling });
	}

	const promises = [];

	// Remove items and ingredients from inventory
	promises.push(
		...itemsAndIngredients.map(item => {
			if (item.isIngredient) {
				return decreaseIngredientQuantity(authed.id, item.itemId, item.quantity);
			} else {
				return decreaseItemQuantity(authed.id, item.itemId, item.quantity);
			}
		})
	);

	await Promise.all(promises);

	// Schedule offer expiration
	scheduleJob(offer.id.toString(), offer.endDate, () => expireOffer(offer.id));
	LOGGER.log(`Player ${authed.id} has set an offer for ${offer.total} ending at ${offer.endDate}`);
}

/**
 * Cancel an offer
 */
export async function cancelOffer(req: Request) {
	// Check if player is logged in
	const authed = await auth(req);

	const playerId = authed.id;
	const offerId = +req.params.offerId;

	// Get user current offers
	const offer = await getOffer(offerId, OfferStatus.ONGOING);

	// Check if user is the seller
	if (!offer || offer.seller.id !== playerId) {
		throw new ExpectedError(translate('invalidOffer', authed));
	}

	// Check if the offer can be cancelled
	if (offer.status !== OfferStatus.ONGOING) {
		throw new ExpectedError(translate('invalidOffer', authed));
	}

	if (offer.bids.length > 0) {
		throw new ExpectedError(translate('offerInProgress', authed));
	}

	const { dinoz, items: itemsAndIngredients } = offer;

	// Separate items and ingredients
	const items = itemsAndIngredients.filter(item => !item.isIngredient);
	const ingredients = itemsAndIngredients.filter(item => item.isIngredient);

	const refund = await checkRefund(playerId, ingredients, items, offer.dinoz, offerId);

	if (typeof refund === 'string') {
		throw new ExpectedError(translate(refund, authed));
	}

	// Set Dinoz as not selling
	if (dinoz) {
		updateDinoz(dinoz.id, { unavailableReason: null });
	}

	const promises = [];

	// Add items to inventory
	promises.push(...items.map(item => increaseItemQuantity(playerId, item.itemId, item.quantity)));

	// Add ingredients to inventory
	promises.push(...ingredients.map(item => increaseIngredientQuantity(playerId, item.itemId, item.quantity)));

	await Promise.all(promises);

	// Reimburse bidders
	if (offer.bids.length > 0) {
		const max = offer.bids.reduce((prev, current) => (prev && prev.value > current.value ? prev : current));
		await increaseItemQuantity(max.userId, itemList[Item.TREASURE_COUPON].itemId, max.value);
	}

	// Delete offer
	await deleteOffer(offerId);
	await createLog(LogType.OfferCancelled, playerId, undefined, offerId);
	const job = scheduledJobs[offerId.toString()];
	job.cancel();
}

/**
 * Bid on an offer
 */
export async function bidOffer(req: Request) {
	// Check if player is logged in
	const authed = await auth(req);

	const offerId = +req.params.offerId;
	const value = +req.body.value;

	// Get user current offers
	const offer = await getOffer(offerId, OfferStatus.ONGOING);

	// Check if user is the seller
	if (!offer || offer.seller.id === authed.id) {
		throw new ExpectedError(translate('invalidOffer', authed));
	}

	// Check if the offer can be bid on
	if (offer.status !== OfferStatus.ONGOING) {
		throw new ExpectedError(translate('invalidOffer', authed));
	}

	// Get previous own bid value
	const previousOwnBid = offer.bids.filter(bid => bid.userId === authed.id).pop()?.value || 0;

	// Cancel if bid is lower or equal to previous bid
	if (value <= previousOwnBid) {
		throw new ExpectedError(translate('bidIsLower', authed));
	}

	// Cancel if bid is lower than offer total
	if (value < offer.total / 1000) {
		throw new ExpectedError(translate('bidIsLower', authed));
	}

	// Cancel if bid is lower than previous bid + 1
	if (offer.bids.length && value < offer.bids[offer.bids.length - 1].value + 1) {
		throw new ExpectedError(translate('bidIsLower', authed));
	}

	// Check if player has enough tickets
	const playerItems = await getPlayerItems(authed.id, { itemId: itemList[Item.TREASURE_COUPON].itemId });
	const playerTickets = playerItems[0]?.quantity || 0;

	if (playerTickets < value - previousOwnBid) {
		throw new ExpectedError(translate('notEnoughTickets', authed));
	}

	// Add bid
	await addBid(offerId, authed.id, value);
	await createLog(LogType.OfferBid, authed.id, undefined, offer.id, value);

	// Repay previous bidder
	if (offer.bids.length > 0) {
		const max = offer.bids.reduce((prev, current) => (prev && prev.value > current.value ? prev : current));
		await increaseItemQuantity(max.userId, itemList[Item.TREASURE_COUPON].itemId, max.value);
	}

	// Remove bid difference from inventory
	await decreaseItemQuantity(authed.id, itemList[Item.TREASURE_COUPON].itemId, value);

	// Add 30s to offer
	const rescheduled = await extendTimer(offer);
	const job = scheduledJobs[offerId.toString()];
	job.cancel();
	job.schedule(rescheduled.endDate);
}

/**
 * Expire an offer
 */
export const expireOffer = async (offerId: number) => {
	const offer = await getOffer(offerId, OfferStatus.ONGOING);

	if (!offer) {
		throw new ExpectedError('Offer not found');
	}

	const winnerBid = offer.bids[offer.bids.length - 1];
	if (winnerBid) {
		// Send Discord notification
		LOGGER.log(`Offer ${offerId} won by ${winnerBid.userId}`);
		await createLog(LogType.OfferWon, offer.seller.id, undefined, offer.id, winnerBid.userId, winnerBid.value);
		// Send buyer notification for won offer
		await createNotification(
			winnerBid.userId,
			JSON.stringify({ offer: offerId, value: winnerBid.value }),
			NotificationSeverity.offerWon
		);
		await addMoney(offer.seller.id, winnerBid.value * 1000);
		// Send seller notification for ended offer
		await createNotification(
			offer.seller.id,
			JSON.stringify({ offer: offerId, value: winnerBid.value }),
			NotificationSeverity.offerEnded
		);
	} else {
		// Send seller notification for expired offer
		await createNotification(offer.seller.id, JSON.stringify({ offer: offerId }), NotificationSeverity.offerExpired);
	}

	if (offer.dinoz) {
		await updateOfferDinoz(offerId, JSON.stringify(offer.dinoz));
	}
	// Update offer status
	await updateOfferStatus(offerId, OfferStatus.ENDED);
	// Update stats tracking
	await setSpecificStat(StatTracking.MARKET, offer.seller.id, 1);
};

/**
 * Claim an ENDED offer
 */
export async function claimOffer(req: Request) {
	const offerId = +req.params.offerId;
	const offer = await getOffer(offerId, OfferStatus.ENDED);
	if (!offer) {
		throw new ExpectedError('Offer not found');
	}
	const authed = await auth(req);

	// Separate items and ingredients
	const items = offer.items.filter(item => !item.isIngredient);
	const ingredients = offer.items.filter(item => item.isIngredient);
	const winnerBid = offer.bids[offer.bids.length - 1];
	const promises = [];

	if (offer.bids.length) {
		const winner = await checkRefund(winnerBid.userId, ingredients, items, offer.dinoz, offerId);

		if (typeof winner === 'string') {
			throw new ExpectedError(translate(winner, authed));
		}
		if (offer.dinoz) {
			// Change Dinoz owner and set as not selling
			updateDinoz(offer.dinoz.id, {
				player: { connect: { id: winnerBid.userId } },
				unavailableReason: null
			});

			// Update seller ranking
			await updateDinozCount(offer.seller.id, -1);
			await updatePoints(offer.seller.id, -offer.dinoz.level);

			// Update winner ranking
			await updateDinozCount(winnerBid.userId, 1);
			await updatePoints(winnerBid.userId, offer.dinoz.level);

			// await updateOfferDinoz(offerId, JSON.stringify(offer.dinoz));
		}

		// Add items to winner inventory
		promises.push(...items.map(item => increaseItemQuantity(winnerBid.userId, item.itemId, item.quantity)));

		// Add ingredients to winner inventory
		promises.push(...ingredients.map(item => increaseIngredientQuantity(winnerBid.userId, item.itemId, item.quantity)));
	} else {
		const refund = await checkRefund(offer.sellerId, ingredients, items, offer.dinoz, offerId);

		if (typeof refund === 'string') {
			throw new ExpectedError(translate(refund, authed));
		}
		// Set Dinoz as not selling
		if (offer.dinoz) {
			updateDinoz(offer.dinoz.id, { unavailableReason: null });
		}
		// Add items to inventory
		promises.push(...items.map(item => increaseItemQuantity(offer.seller.id, item.itemId, item.quantity)));

		// Add ingredients to inventory
		promises.push(...ingredients.map(item => increaseIngredientQuantity(offer.seller.id, item.itemId, item.quantity)));

		// Send Discord notification
		LOGGER.log(`Offer ${offerId} expired`);
		await createLog(LogType.OfferExpired, offer.seller.id, undefined, offer.id);
	}

	// Update offer status
	await updateOfferStatus(offerId, OfferStatus.CLAIMED);

	await Promise.all(promises);
}

export async function checkRefund(
	playerId: string,
	ingredients: { itemId: number; quantity: number; isIngredient: boolean }[],
	items: { itemId: number; quantity: number; isIngredient: boolean }[],
	dinoz: Pick<Dinoz, 'playerId'> | null,
	offerId: number
) {
	const refund = await prepareRefund(
		playerId,
		ingredients.map(p => p.itemId),
		items.map(i => i.itemId)
	);

	if (dinoz) {
		const maxDinoz =
			gameConfig.dinoz.maxQuantity +
			(refund.leader ? 3 : 0) +
			(refund.messie ? 3 : 0) +
			(dinoz.playerId === playerId ? 1 : 0);
		if (refund._count.dinoz + 1 > maxDinoz) {
			return 'tooMuchDinoz';
		}
	}

	const shopKeeper = refund.shopKeeper;

	const ingredientsWithMaxQuantity = Object.values(ingredientList)
		.filter(i => {
			return ingredients.some(a => a.itemId === i.ingredientId);
		})
		.filter(i => {
			return refund.ingredients.some(a => a.ingredientId === i.ingredientId);
		})
		.map(i => {
			const playerIng = refund.ingredients.find(a => a.ingredientId === i.ingredientId);
			const marketIng = ingredients.find(a => a.itemId === i.ingredientId);
			if (!playerIng || !marketIng) {
				LOGGER.error(
					`Cannot find ingredient ${i.name} in offer or database for offer ${offerId} when player ${playerId} refund.`
				);
				throw new ExpectedError(`Cannot find ingredient ${i.name} in offer or database`);
			}
			return {
				ingredientId: i.ingredientId,
				maxQuantity: shopKeeper ? i.maxQuantity * 1.5 : i.maxQuantity,
				futureQuantity: playerIng.quantity + marketIng.quantity
			};
		});
	const itemWithMaxQuantity = Object.values(itemList)
		.filter(i => {
			return items.some(a => a.itemId === i.itemId);
		})
		.filter(i => {
			return refund.items.some(a => a.itemId === i.itemId);
		})
		.map(i => {
			const playerItems = refund.items.find(a => a.itemId === i.itemId);
			const marketItems = items.find(a => a.itemId === i.itemId);
			if (!playerItems || !marketItems) {
				LOGGER.error(
					`Cannot find item ${i.name} in offer or database for offer ${offerId} when player ${playerId} refund.`
				);
				throw new ExpectedError(`Cannot find item ${i.name} in offer or database`);
			}
			return {
				itemId: i.itemId,
				maxQuantity: shopKeeper ? i.maxQuantity * 1.5 : i.maxQuantity,
				futureQuantity: playerItems.quantity + marketItems.quantity
			};
		});

	if (ingredientsWithMaxQuantity.some(i => i.futureQuantity >= i.maxQuantity)) {
		return 'tooMuchIngredient';
	}
	if (itemWithMaxQuantity.some(i => i.futureQuantity >= i.maxQuantity)) {
		return 'tooMuchItem';
	}
	return true;
}

/**
 * Schedule offers expiration
 */
export const scheduleOffersExpiration = async () => {
	const ongoingOffers = await getOngoingOffers();

	// Process outdated offers immediately
	const outdatedOffers = ongoingOffers.filter(offer => offer.endDate <= new Date());
	const promises = outdatedOffers.map(offer => expireOffer(offer.id));

	await Promise.all(promises);

	// Schedule expiration for remaining offers
	const remainingOffers = ongoingOffers.filter(offer => offer.endDate > new Date());

	remainingOffers.forEach(offer => {
		LOGGER.log(`Scheduling offer ${offer.id} expiration at ${offer.endDate}`);

		scheduleJob(offer.id.toString(), offer.endDate, () => expireOffer(offer.id));
	});
};
