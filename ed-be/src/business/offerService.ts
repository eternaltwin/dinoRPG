import { MissionID } from '@drpg/core/models/missions/missionList';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import { MissionsPageData } from '@drpg/core/returnTypes/Dinoz';
import { Request } from 'express';
import { getGlobalMissionsData } from '../dao/dinozDao.js';
import { getPlayerRewards } from '../dao/playerRewardsDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { getOfferListData, insertOffer } from '../dao/offerDao.js';
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

	// Get filtered offers
	const offers = await getOfferListData(filter);

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

