import { Request } from 'express';
import { ErrorFormator } from '../utils/errorFormator.js';
import { addBid, deleteOffer, getOffer, getOffers, insertOffer } from '../dao/offerDao.js';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { itemList } from '@drpg/core/models/item/ItemList';
import { updateDinoz } from '../dao/dinozDao.js';
import { decreaseItemQuantity, increaseItemQuantity } from '../dao/playerItemDao.js';
import { decreaseIngredientQuantity, increaseIngredientQuantity } from '../dao/playerIngredientDao.js';

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
		const ingredientData = ingredientList[ingredient.name];

		if (!ingredientData) {
			throw new Error('Ingredient not found');
		}

		return {
			itemId: ingredientData.ingredientId,
			quantity: ingredient.count,
			isIngredient: true
		}
	}));

	itemsAndIngredients.push(...items.map(item => {
		const itemData = itemList[item.name];

		if (!itemData) {
			throw new Error('Item not found');
		}

		return {
			itemId: itemData.itemId,
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
