import { Request } from 'express';
import { ErrorFormator } from '../utils/errorFormator.js';
import { addBid, deleteOffer, getOffer, getOffers, insertOffer, updateOfferStatus } from '../dao/offerDao.js';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { itemList } from '@drpg/core/models/item/ItemList';
import { updateDinoz } from '../dao/dinozDao.js';
import { decreaseItemQuantity, getPlayerItems, increaseItemQuantity } from '../dao/playerItemDao.js';
import { decreaseIngredientQuantity, getAllIngredientsDataRequest, increaseIngredientQuantity } from '../dao/playerIngredientDao.js';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { OfferStatus } from '@drpg/prisma';
import { scheduleJob } from 'node-schedule';
import { sendDiscord } from '../utils/discord.js';

/**
 * Get the list of current offers
 */
export async function getOfferList(req: Request) {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'missingUser');
	}

	const filter = req.params.filter;
	const sellerId = req.query.sellerId ? +req.query.sellerId : null;
	const bidderId = req.query.bidderId ? +req.query.bidderId : null;
	const expired = req.query.expired ? req.query.expired === 'true' : false;

	// Get filtered offers
	const offers = await getOffers(req.auth.playerId, filter, sellerId, bidderId, expired);

	return offers;
}

/**
 * Create a new offer
 */
export async function createOffer(req: Request) {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'missingUser');
	}

	const playerId = req.auth.playerId;

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

	// Group items and ingredients
	const itemsAndIngredients = [];

	itemsAndIngredients.push(...ingredients.map(ingredient => {
		console.log(ingredient);
		const ingredientData = ingredientList[ingredient.name.toLocaleUpperCase()];

		if (!ingredientData) {
			throw new Error('Ingredient not found');
		}

		return {
			itemId: ingredientData.ingredientId,
			quantity: ingredient.count,
			isIngredient: true
		}
	}));

	// Get available items and ingredients
	const availableItems = await getPlayerItems(playerId);
	const availableIngredients = await getAllIngredientsDataRequest(playerId);

	// Check if user has enough items and ingredients
	for (const item of itemsAndIngredients) {
		if (item.isIngredient) {
			const availableIngredient = availableIngredients.find(availableIngredient => availableIngredient.ingredientId === item.itemId);

			if (!availableIngredient || availableIngredient.quantity < item.quantity) {
				throw new ErrorFormator(500, 'notEnoughIngredients');
			}
		} else {
			const availableItem = availableItems.find(availableItem => availableItem.itemId === item.itemId);

			if (!availableItem || availableItem.quantity < item.quantity) {
				throw new ErrorFormator(500, 'notEnoughItems');
			}
		}
	}

	itemsAndIngredients.push(...items.map(item => {
		console.log(item);
		const itemId = Object.entries(itemNameList).find(([, value]) => value === item.name)?.[0];

		if (!itemId) {
			throw new Error('Item not found');
		}

		return {
			itemId: +itemId,
			quantity: item.count,
			isIngredient: false
		}
	}));

	// Insert offer
	await insertOffer(
		dinozId,
		total,
		itemsAndIngredients,
		playerId
	);

	// Set Dinoz as selling
	if (dinozId) {
		updateDinoz(dinozId, { isSelling: true });
	}

	const promises = [];

	// Remove items and ingredients from inventory
	promises.push(...itemsAndIngredients.map(item => {
		if (item.isIngredient) {
			return decreaseIngredientQuantity(playerId, item.itemId, item.quantity);
		} else {
			return decreaseItemQuantity(playerId, item.itemId, item.quantity);
		}
	}));

	await Promise.all(promises);
}

/**
 * Cancel an offer
 */
export async function cancelOffer(req: Request) {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'missingUser');
	}

	const playerId = req.auth.playerId;
	const offerId = +req.params.offerId;

	// Get user current offers
	const offer = await getOffer(offerId);

	// Check if user is the seller
	if (!offer || offer.seller.id !== playerId) {
		throw new ErrorFormator(500, 'invalidOffer');
	}

	const { dinoz, items: itemsAndIngredients } = offer;

	// Set Dinoz as not selling
	if (dinoz) {
		updateDinoz(dinoz.id, { isSelling: false });
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
	const bids = offer.bids.reduce((acc, bid) => {
		if (!acc[bid.userId] || acc[bid.userId] < bid.value) {
			acc[bid.userId] = bid.value;
		}

		return acc;
	}, {} as Record<number, number>);

	const ticketPromises = [];

	// Add tickets to inventory
	ticketPromises.push(
		...Object.entries(bids)
			.map(([userId, value]) => increaseItemQuantity(
				+userId,
				itemList.TREASURE_COUPON.itemId,
				value,
			))
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
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'missingUser');
	}

	const playerId = req.auth.playerId;

	const offerId = +req.params.offerId;
	const value = +req.body.value;

	// Get user current offers
	const offer = await getOffer(offerId);

	// Check if user is the seller
	if (!offer || offer.seller.id === playerId) {
		throw new ErrorFormator(400, 'invalidOffer');
	}

	// TODO: Check if user has enough ticket in inventory

	// Get previous own bid value
	const previousOwnBid = offer.bids.filter(bid => bid.userId === playerId).pop()?.value || 0;

	// Cancel if bid is lower or equal to previous bid
	if (value <= previousOwnBid) {
		throw new ErrorFormator(400, 'bidIsLower');
	}

	// Cancel if bid is lower than offer total
	if (value < offer.total / 1000) {
		throw new ErrorFormator(400, 'bidIsLower');
	}

	// Cancel if bid is lower than previous bid + 1
	if (offer.bids.length && value < offer.bids[offer.bids.length - 1].value + 1) {
		throw new ErrorFormator(400, 'bidIsLower');
	}

	// Add bid
	await addBid(offerId, req.auth.playerId, value);

	const bidDifference = value - previousOwnBid;

	// Remove bid difference from inventory
	await decreaseItemQuantity(playerId, itemList.TREASURE_COUPON.itemId, bidDifference);
}

/**
 * Expire an offer
 */
export const expireOffer = async (offerId: number) => {
	const offer = await getOffer(offerId);

	if (!offer) {
		throw new Error('Offer not found');
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
				isSelling: false
			});

			// Add items to winner inventory
			promises.push(...items.map(item => increaseItemQuantity(winnerBid.userId, item.itemId, item.quantity)));

			// Add ingredients to winner inventory
			promises.push(...ingredients.map(item => increaseIngredientQuantity(winnerBid.userId, item.itemId, item.quantity)));

			// Send Discord notification
			sendDiscord(`Offer ${offerId} won by ${winnerBid.userId}`);
		}
	} else {
		// Refund seller if there is no bid

		// Set Dinoz as not selling
		if (offer.dinoz) {
			updateDinoz(offer.dinoz.id, { isSelling: false });
		}

		// Add items to inventory
		promises.push(...items.map(item => increaseItemQuantity(offer.seller.id, item.itemId, item.quantity)));

		// Add ingredients to inventory
		promises.push(...ingredients.map(item => increaseIngredientQuantity(offer.seller.id, item.itemId, item.quantity)));

		// Send Discord notification
		sendDiscord(`Offer ${offerId} expired`);
	}

	await Promise.all(promises);

	// Update offer status
	await updateOfferStatus(offerId, OfferStatus.ENDED);
};

/**
 * Schedule offers expiration
 */
export const scheduleOffersExpiration = async () => {
	const ongoingOffers = await getOffers(null, 'all', null, null, false);

	// Process outdated offers immediately
	const outdatedOffers = ongoingOffers.filter(offer => offer.endDate <= new Date());
	const promises = outdatedOffers.map(offer => expireOffer(offer.id));

	await Promise.all(promises);

	// Schedule expiration for remaining offers
	const remainingOffers = ongoingOffers.filter(offer => offer.endDate > new Date());

	remainingOffers.forEach(offer => {
		console.log(`Scheduling offer ${offer.id} expiration at ${offer.endDate}`);

		scheduleJob(offer.endDate, () => expireOffer(offer.id));
	});
};
