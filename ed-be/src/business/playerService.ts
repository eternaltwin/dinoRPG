import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import { toDinozFiche, toDinozFicheLite } from '@drpg/core/utils/DinozUtils';
import { Request } from 'express';
import { getAllDinozFicheLite, getDinozTotalCount } from '../dao/dinozDao.js';
import {
	getCommonDataRequest,
	getPlayerDataRequest,
	getPlayerRewardsRequest,
	searchPlayersByName,
	setPlayer
} from '../dao/playerDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';

/**
 * @summary Get data from player on login
 * @param req
 * @return Player
 */
export async function getCommonData(req: Request) {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}
	const playerCommonData = await getCommonDataRequest(req.auth.playerId);
	if (!playerCommonData) {
		throw new ErrorFormator(500, `Player ${req.auth.playerId} doesn't exist.`);
	}

	const commonData: PlayerCommonData = {
		money: playerCommonData.money,
		dinozCount: await getDinozTotalCount(),
		dinoz: playerCommonData.dinoz.map(dinoz => {
			return toDinozFiche({
				...dinoz,
				player: {
					engineer: playerCommonData.engineer,
					rewards: playerCommonData.rewards,
					items: playerCommonData.items,
				},
			});
		}),
		id: playerCommonData.id,
		name: playerCommonData.name,
		playerOptions: {
			hasPDA: playerCommonData.rewards.some(reward => reward.rewardId === rewardList.PDA),
			hasPMI: playerCommonData.rewards.some(reward => reward.rewardId === rewardList.PMI)
		}
	};
	return commonData;
}

/**
 * @summary Get data from an account
 * @param req
 * @param req.params.id {string} PlayerId
 * @return PlayerInfo
 */
export async function getAccountData(req: Request) {
	const playerId = +req.params.id;
	const playerInfo = await getPlayerDataRequest(playerId);
	if (!playerInfo) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	// Subscription date
	const date = playerInfo.createdDate.toLocaleString().split(',')[0].split('/');
	const formatter = new Intl.DateTimeFormat('fr', { month: 'long' });
	const month = formatter.format(new Date(parseInt(date[2]), parseInt(date[0]) - 1, parseInt(date[1])));
	const subscribe = `${date[1]} ${month} ${date[2]}`;

	// Clan TODO
	const clan: string | undefined = undefined;

	if (!playerInfo.ranking) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't have a ranking.`);
	}

	const infoToSend: PlayerInfo = {
		dinozCount: playerInfo.ranking.dinozCountDisplayed,
		rank: playerInfo.ranking.sumPosition,
		pointCount: playerInfo.ranking.sumPointsDisplayed,
		subscribeAt: subscribe,
		clan: clan,
		playerName: playerInfo.name,
		epicRewards: playerInfo.rewards.map(reward => reward.rewardId).sort((a, b) => a - b),
		dinoz: playerInfo.dinoz.map(dinoz => {
			return toDinozFiche({
				...dinoz,
				player: {
					engineer: playerInfo.engineer,
					rewards: playerInfo.rewards,
					items: playerInfo.items,
				},
			});
		}),
		customText: playerInfo.customText
		// twinoid: playerInfo.twinosite.map(i => {return {siteId: i.siteId, points: i.points, npoints: i.npoints}})
	};

	return infoToSend;
}

/**
 * @summary Set custom text for a player
 * @param req
 * @param req.body.message {string} Message to set as custom text
 * @return void
 */
export async function setCustomText(req: Request) {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}

	const playerId: number = req.auth.playerId;
	const playerProfile = await getPlayerRewardsRequest(playerId);
	if (!playerProfile) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}
	//Check if user can edit
	if (!playerProfile.rewards.some(reward => reward.rewardId === rewardList.PLUME)) {
		throw new ErrorFormator(500, `Player ${playerId} cannot edit this field`);
	}

	await setPlayer(playerId, { customText: req.body.message });
}

/**
 * @summary Fetch a list of player based on a string
 * @param req
 * @param req.params.id {string}
 * @return Array<Player>
 */
export async function searchPlayers(req: Request) {
	const playerList = await searchPlayersByName(req.params.name);

	return playerList;
}

export async function getDinozList(req: Request) {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}

	const playerId: number = req.auth.playerId;
	const dinozActive = await getAllDinozFicheLite(playerId);
	if (!dinozActive) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	return dinozActive.map(dinoz => toDinozFicheLite(dinoz)).filter(dinoz => !dinoz.isFrozen);
}
