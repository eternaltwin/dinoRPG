import { MissionID } from '@drpg/core/models/missions/missionList';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import { MissionsPageData } from '@drpg/core/returnTypes/Dinoz';
import { Request } from 'express';
import { getGlobalMissionsData } from '../dao/dinozDao.js';
import { getPlayerRewards } from '../dao/playerRewardsDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { getOfferListData } from '../dao/offerDao.js';
import { Offer } from '@drpg/core/returnTypes/Offer';

/**
 * Get the list of current offers
 */
export async function getOfferList(req: Request): Promise<Offer[]> {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	const filter = req.params.filter;

	// Get filtered offers
	const offers = await getOfferListData(filter);

	return offers;
}
