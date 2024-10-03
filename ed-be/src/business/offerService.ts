import { Request } from 'express';
import { addBid, deleteOffer, getOffer, getOffers, insertOffer, updateOfferStatus } from '../dao/offerDao.js';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { getDinozPlace, updateDinoz } from '../dao/dinozDao.js';
import { decreaseItemQuantity, getPlayerItems, increaseItemQuantity } from '../dao/playerItemDao.js';
import {
	decreaseIngredientQuantity,
	getAllIngredientsDataRequest,
	increaseIngredientQuantity
} from '../dao/playerIngredientDao.js';
import { OfferStatus, UnavailableReason } from '@drpg/prisma';
import { scheduleJob } from 'node-schedule';
import { addMoney, auth, ownsDinoz } from '../dao/playerDao.js';
import { updateDinozCount, updatePoints } from '../dao/rankingDao.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { setSpecificStat } from '../dao/trackingDao.js';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { LOGGER } from '../context.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';

/**
 * Get the list of current offers
 */
export async function getOfferList(req: Request) {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ExpectedError('missingUser');
	}

	const filter = req.params.filter;
	const sellerId = req.query.sellerId ? +req.query.sellerId : null;
	const bidderId = req.query.bidderId ? +req.query.bidderId : null;
	const expired = req.query.expired ? req.query.expired === 'true' : false;
	const page = req.query.page ? +req.query.page : 1;

	// Get filtered offers
	const offers = await getOffers(req.auth.playerId, filter, sellerId, bidderId, expired, page);

	return offers;
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

	const offers = await getOffers(authed.id, 'own', authed.id, null, false, 1);

	if (offers.length > 0) {
		throw new ExpectedError(translate('alreadyOffer', authed));
	}

	if (dinozId) {
		// Check if player owns the Dinoz
		const owns = await ownsDinoz(authed.id, dinozId);

		if (!owns) {
			throw new ExpectedError('invalidDinoz');
		}

		const dinozPlace = await getDinozPlace(dinozId);
		if (dinozPlace && dinozPlace.placeId !== PlaceEnum.PLACE_DU_MARCHE) {
			throw new ExpectedError('Dinoz is not at the right place to do this.');
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
				throw new ExpectedError('notEnoughIngredients');
			}
		} else {
			const availableItem = availableItems.find(availableItem => availableItem.itemId === item.itemId);

			if (!availableItem || availableItem.quantity < item.quantity) {
				throw new ExpectedError('notEnoughItems');
			}
		}
	}

	// Insert offer
	const offer = await insertOffer(dinozId, total, itemsAndIngredients, authed.id);
	// console.log(itemsAndIngredients);

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
	scheduleJob(offer.endDate, () => expireOffer(offer.id));
	LOGGER.log(`Player ${authed.id} has set an offer for ${offer.total} ending at ${offer.endDate}`);
}

/**
 * Cancel an offer
 */
export async function cancelOffer(req: Request) {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ExpectedError('missingUser');
	}

	const playerId = req.auth.playerId;
	const offerId = +req.params.offerId;

	// Get user current offers
	const offer = await getOffer(offerId);

	// Check if user is the seller
	if (!offer || offer.seller.id !== playerId) {
		throw new ExpectedError('invalidOffer');
	}

	// Check if the offer can be cancelled
	if (offer.status !== OfferStatus.ONGOING) {
		throw new ExpectedError('invalidOffer');
	}

	const { dinoz, items: itemsAndIngredients } = offer;

	// Set Dinoz as not selling
	if (dinoz) {
		updateDinoz(dinoz.id, { unavailableReason: null });
	}

	// Separate items and ingredients
	const items = itemsAndIngredients.filter(item => !item.isIngredient);
	const ingredients = itemsAndIngredients.filter(item => item.isIngredient);

	const promises = [];

	// Add items to inventory
	promises.push(...items.map(item => increaseItemQuantity(playerId, item.itemId, item.quantity)));

	// Add ingredients to inventory
	promises.push(...ingredients.map(item => increaseIngredientQuantity(playerId, item.itemId, item.quantity)));

	await Promise.all(promises);

	// Reimburse bidders

	// Bids can contain multiple bids from the same user, keep only the highest one
	const bids = offer.bids.reduce(
		(acc, bid) => {
			if (!acc[bid.userId] || acc[bid.userId] < bid.value) {
				acc[bid.userId] = bid.value;
			}

			return acc;
		},
		{} as Record<number, number>
	);

	const ticketPromises = [];

	// Add tickets to inventory
	ticketPromises.push(
		...Object.entries(bids).map(([userId, value]) =>
			increaseItemQuantity(+userId, itemList[Item.TREASURE_COUPON].itemId, value)
		)
	);

	await Promise.all(ticketPromises);

	// Delete offer
	await deleteOffer(offerId);
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
	const offer = await getOffer(offerId);

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

	// Remove bid difference from inventory
	await decreaseItemQuantity(authed.id, itemList[Item.TREASURE_COUPON].itemId, value);

	// Repay previous bidder
	if (offer.bids.length > 0) {
		const max = offer.bids.reduce((prev, current) => (prev && prev.value > current.value ? prev : current));
		await increaseItemQuantity(max.userId, itemList[Item.TREASURE_COUPON].itemId, max.value);
	}
}

/**
 * Expire an offer
 */
export const expireOffer = async (offerId: number) => {
	const offer = await getOffer(offerId);

	if (!offer) {
		throw new ExpectedError('Offer not found');
	}

	// Separate items and ingredients
	const items = offer.items.filter(item => !item.isIngredient);
	const ingredients = offer.items.filter(item => item.isIngredient);
	const promises = [];

	// Process offer if there is at least one bid
	if (offer.bids.length) {
		const winnerBid = offer.bids[offer.bids.length - 1];

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
		}

		// Add items to winner inventory
		promises.push(...items.map(item => increaseItemQuantity(winnerBid.userId, item.itemId, item.quantity)));

		// Add ingredients to winner inventory
		promises.push(...ingredients.map(item => increaseIngredientQuantity(winnerBid.userId, item.itemId, item.quantity)));

		// Send Discord notification
		LOGGER.log(`Offer ${offerId} won by ${winnerBid.userId}`);

		await addMoney(offer.seller.id, winnerBid.value * 1000);
		// Update stats tracking
		await setSpecificStat(StatTracking.MARKET, offer.seller.id, 1);
	} else {
		// Refund seller if there is no bid

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
	}

	await Promise.all(promises);

	// Update offer status
	await updateOfferStatus(offerId, OfferStatus.ENDED);
};

/**
 * Schedule offers expiration
 */
export const scheduleOffersExpiration = async () => {
	const ongoingOffers = await getOffers(null, 'all', null, null, false, 1);

	// Process outdated offers immediately
	const outdatedOffers = ongoingOffers.filter(offer => offer.endDate <= new Date());
	const promises = outdatedOffers.map(offer => expireOffer(offer.id));

	await Promise.all(promises);

	// Schedule expiration for remaining offers
	const remainingOffers = ongoingOffers.filter(offer => offer.endDate > new Date());

	remainingOffers.forEach(offer => {
		LOGGER.log(`Scheduling offer ${offer.id} expiration at ${offer.endDate}`);

		scheduleJob(offer.endDate, () => expireOffer(offer.id));
	});
};
