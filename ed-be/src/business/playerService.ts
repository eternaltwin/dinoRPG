import { Request } from 'express';
import {
	getCommonDataRequest,
	getPlayerDataRequest,
	getPlayerRewardsRequest,
	searchPlayersByName,
	setPlayer
} from '../dao/playerDao.js';
import { Player } from '../entity/player.js';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { getAllDinozFicheLite, getDinozTotalCount } from '../dao/dinozDao.js';
import { Dinoz } from '../entity/index.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import { levelList } from '@drpg/core/models/dinoz/DinozLevel';

/**
 * @summary Get data from player on login
 * @param req
 * @return Player
 */
export async function getCommonData(req: Request): Promise<PlayerCommonData> {
	const playerCommonData: Player | null = await getCommonDataRequest(req.auth!.playerId!);
	if (!playerCommonData) {
		throw new ErrorFormator(500, `Player ${req.auth!.playerId!} doesn't exist.`);
	}

	const commonData: PlayerCommonData = {
		money: playerCommonData.money,
		dinozCount: await getDinozTotalCount(),
		dinoz: playerCommonData.dinoz.map(dinoz => {
			return {
				id: dinoz.id,
				following: dinoz.following,
				display: dinoz.display,
				name: dinoz.name,
				life: dinoz.life,
				maxLife: dinoz.maxLife,
				experience: dinoz.experience,
				maxExperience: levelList.find(level => level.id === dinoz.level)!.experience,
				placeId: dinoz.placeId,
				level: dinoz.level,
				order: dinoz.order
			};
		}),
		id: playerCommonData.id,
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
export async function getAccountData(req: Request): Promise<PlayerInfo> {
	const playerId: number = parseInt(req.params.id);
	const playerInfo: Player | null = await getPlayerDataRequest(playerId);
	if (!playerInfo) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	// Subscription date
	const date: Array<string> = playerInfo.createdDate.toLocaleString().split(',')[0].split('/');
	const formatter = new Intl.DateTimeFormat('fr', { month: 'long' });
	const month: string = formatter.format(new Date(parseInt(date[2]), parseInt(date[0]) - 1, parseInt(date[1])));
	const subscribe: string = `${date[1]} ${month} ${date[2]}`;

	// Clan TODO
	const clan: string | undefined = undefined;

	const infoToSend: PlayerInfo = {
		dinozCount: playerInfo.rank.dinozCountDisplayed,
		rank: playerInfo.rank.sumPosition,
		pointCount: playerInfo.rank.sumPointsDisplayed,
		subscribeAt: subscribe,
		clan: clan,
		playerName: playerInfo!.name,
		epicRewards: playerInfo.rewards.map(reward => reward.rewardId).sort((a, b) => a - b),
		dinoz: playerInfo.dinoz.map(dinoz => {
			return {
				id: dinoz.id,
				display: dinoz.display,
				name: dinoz.name,
				level: dinoz.level,
				raceId: dinoz.raceId,
				life: dinoz.life,
				status: dinoz.status.map(status => status.statusId),
				isFrozen: dinoz.isFrozen
			};
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
export async function setCustomText(req: Request): Promise<void> {
	const playerId: number = req.auth!.playerId!;
	const playerProfile: Player | null = await getPlayerRewardsRequest(playerId);
	if (!playerProfile) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}
	//Check if user can edit
	if (!playerProfile.rewards.some(reward => reward.rewardId === rewardList.PLUME)) {
		throw new ErrorFormator(500, `Player ${playerId} cannot edit this field`);
	}

	await setPlayer({ id: playerId, customText: req.body.message });
}

/**
 * @summary Fetch a list of player based on a string
 * @param req
 * @param req.params.id {string}
 * @return Array<Player>
 */
export async function searchPlayers(req: Request): Promise<Array<Player>> {
	const playerList: Array<Player> = await searchPlayersByName(req.params.name);

	return playerList;
}

export async function getDinozList(req: Request): Promise<Array<any>> {
	const playerId: number = req.auth!.playerId!;
	const dinozActive: Array<Dinoz> | undefined = await getAllDinozFicheLite(playerId);
	if (!dinozActive) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	return dinozActive.map(dinoz => dinoz.toDinozFicheLite()).filter(dinoz => !dinoz.isFrozen);
}
