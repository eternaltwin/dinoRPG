import { MissionID } from '@drpg/core/models/missions/missionList';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import { MissionsPageData } from '@drpg/core/returnTypes/Dinoz';
import { Request } from 'express';
import { getGlobalMissionsData } from '../dao/dinozDao.js';
import { getPlayerRewards } from '../dao/playerRewardsDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { deleteOffer, getOffers, insertOffer } from '../dao/offerDao.js';
import { Offer } from '@drpg/core/returnTypes/Offer';

/**
 * Get the list of current offers
 */
export async function getOfferList(req: Request) {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	const filter = req.params.filter;
	const sellerId = req.query.sellerId ? +req.query.sellerId : null;
	const bidderId = req.query.bidderId ? +req.query.bidderId : null;

	// Get filtered offers
	const offers = await getOffers(filter, sellerId, bidderId);

	return offers;
}

/**
 * Create a new offer
 */
export async function createOffer(req: Request) {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'No player found');
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
		throw new ErrorFormator(500, 'No player found');
	}

	const offerId = +req.params.offerId;

	// Get user current offers
	const offers = await getOffers('all', req.auth.playerId, null);

	// Check if user is the seller
	const offer = offers.find(offer => offer.id === offerId);

	if (!offer) {
		throw new ErrorFormator(500, 'Offer not found');
	}

	const { dinoz, items: itemsAndIngredients } = offer;

	// TODO: Set Dinoz as not selling

	// Separate items and ingredients
	const ingredients = itemsAndIngredients.filter(item => item.isIngredient);
	const items = itemsAndIngredients.filter(item => !item.isIngredient);

	// TODO: Add items to inventory
	// TODO: Add ingredients to inventory

	// Delete offer
	await deleteOffer(offerId);
}

