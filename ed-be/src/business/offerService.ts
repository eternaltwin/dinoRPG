import { Request } from 'express';
import { ErrorFormator } from '../utils/errorFormator.js';
import { addBid, deleteOffer, getOffer, getOffers, insertOffer } from '../dao/offerDao.js';

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

	const dinozId = req.body.dinoz ? +req.body.dinoz : null;
	const total = +req.body.total;
	const ingredients = req.body.ingredients as {
		name: string;
		count: number;
	}[];
	const items = req.body.items as {
		id: number;
		count: number;
	}[];

	// Insert offer
	const offers = await insertOffer(
		dinozId,
		total,
		ingredients,
		items
	);

	console.log(offers);

	// TODO: Set Dinoz as selling
	// TODO: Remove items from inventory
	// TODO: Remove ingredients from inventory
}

/**
 * Cancel an offer
 */
export async function cancelOffer(req: Request) {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'missingUser');
	}

	const offerId = +req.params.offerId;

	// Get user current offers
	const offer = await getOffer(offerId);

	// Check if user is the seller
	if (!offer || offer.seller.id !== req.auth.playerId) {
		throw new ErrorFormator(500, 'invalidOffer');
	}

	const { dinoz, items: itemsAndIngredients } = offer;

	console.log(dinoz);

	// TODO: Set Dinoz as not selling

	// Separate items and ingredients
	const ingredients = itemsAndIngredients.filter(item => item.isIngredient);
	const items = itemsAndIngredients.filter(item => !item.isIngredient);

	console.log(ingredients);
	console.log(items);

	// TODO: Add items to inventory
	// TODO: Add ingredients to inventory
	// TODO: Reimburse bidders

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
	const previousOwnBid = offer.bids.filter(bid => bid.user.id === playerId).pop()?.value || 0;

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

	// Remove bid difference from inventory
	const bidDifference = value - previousOwnBid;

	console.log(bidDifference);

	// TODO: Remove bid difference from inventory
}
