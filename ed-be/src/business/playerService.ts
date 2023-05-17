import { Request } from 'express';
import {
	getCommonDataRequest,
	getImportedData,
	getPlayerDataRequest,
	getPlayerRewardsRequest,
	resetUser,
	searchPlayersByName,
	setPlayer
} from '../dao/playerDao.js';
import { rewardList } from '../constants/reward.js';
import { Player } from '../entity/player.js';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { addRewardToPlayer } from '../dao/playerRewardsDao.js';
import { getDinozTotalCount } from '../dao/dinozDao.js';
import { levelList } from '../constants/index.js';
import { PlayerReward } from '../entity/index.js';
import { ErrorFormator } from '../utils/errorFormator.js';

/**
 * @summary Get data from player on login
 * @param req
 * @return Player
 */
export async function getCommonData(req: Request): Promise<PlayerCommonData> {
	const playerCommonData: Player = await getCommonDataRequest(req.user!.playerId!);

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
			hasPDA: playerCommonData.rewards.some(reward => reward.rewardId === rewardList.PDA)
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
	const playerInfo: Player = await getPlayerDataRequest(playerId);

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
		epicRewards: playerInfo.rewards.map(reward => reward.rewardId),
		dinoz: playerInfo.dinoz.map(dinoz => {
			return {
				id: dinoz.id,
				display: dinoz.display,
				name: dinoz.name,
				level: dinoz.level,
				raceId: dinoz.raceId,
				life: dinoz.life,
				status: dinoz.status.map(status => status.statusId)
			};
		}),
		customText: playerInfo.customText
	};

	return infoToSend;
}

/**
 * @summary Import a specified account
 * @param req
 * @param req.body.server {string} Server where the player came from
 * @return void
 */
export async function importAccount(req: Request): Promise<void> {
	const playerId: number = req.user!.playerId!;
	//const server: string = req.body.server;
	const importedData: Player = await getImportedData(playerId);

	//Check if user has not already imported
	if (importedData.hasImported) {
		throw new ErrorFormator(500, `Player ${playerId} has already imported his account`);
	}

	//Check if user has data in Eternaltwin's API

	//Reset all data for this user except the user's row in tb_player
	await resetUser(playerId);

	// TODO Import from Eternaltwin's API
	// const userET: string = importedData.eternalTwinId;

	//Give Epic Reward
	await addRewardToPlayer(new PlayerReward(importedData, rewardList.IMPORT));

	//Set hasImported to true
	await setPlayer({ id: playerId, hasImported: true });
}

/**
 * @summary Set custom text for a player
 * @param req
 * @param req.body.message {string} Message to set as custom text
 * @return void
 */
export async function setCustomText(req: Request): Promise<void> {
	const playerId: number = req.user!.playerId!;
	const playerProfile: Player = await getPlayerRewardsRequest(playerId);

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
