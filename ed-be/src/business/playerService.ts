import { Request, Response } from 'express';
import { getDinozTotalCount } from '../dao/dinozDao.js';
import { validationResult } from 'express-validator';
import {
	getCommonDataRequest,
	getImportedData,
	getPlayerDataRequest,
	resetUser,
	setHasImported,
	editCustomText,
	getPlayerRewardsRequest,
	searchPlayersByName
} from '../dao/playerDao.js';

import { Player, PlayerInfo } from '../models/index.js';
import { addRewardToPlayer } from '../dao/assPlayerRewardsDao.js';
import { rewardList } from '../constants/reward.js';

/**
 * @summary Get data from player on login
 * @param req
 * @param res {Player}
 * @return Player
 */
const getCommonData = async (req: Request, res: Response): Promise<Response> => {
	const commonData: Player | null = await getCommonDataRequest(req.user!.playerId!);
	commonData?.setDataValue('dinozCount', await getDinozTotalCount());
	return res.status(200).send(commonData);
};

/**
 * @summary Get data from an account
 * @param req
 * @param req.params.id {string} PlayerId
 * @param res {PlayerInfo}
 * @return PlayerInfo
 */
const getAccountData = async (req: Request, res: Response): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	const playerId: number = parseInt(req.params.id);
	const playerInfo: Player | null = await getPlayerDataRequest(playerId);

	if (playerInfo === null) {
		return res.status(500).send(`Player ${playerId} doesn't exists`);
	}

	//TODO Récuperer via tb_ranking
	const rank: number = 1;

	// Compte du nombre de point
	//TODO Récuperer via tb_ranking
	const pointCount: number = playerInfo.dinoz.reduce((acc, dinoz) => (acc += dinoz.level), 0);

	// Subscription date
	const date = playerInfo.createdAt.toLocaleString().split(',')[0].split('/');
	const formatter = new Intl.DateTimeFormat('fr', { month: 'long' });
	const month = formatter.format(new Date(parseInt(date[2]), parseInt(date[0]) - 1, parseInt(date[1])));
	const subscribe: string = `${date[1]} ${month} ${date[2]}`;

	// Clan TODO
	const clan: string | undefined = undefined;

	// Rewards
	let epicRewards: Array<number> = [];
	playerInfo.reward.forEach(reward => epicRewards.push(reward.rewardId));

	// Status
	playerInfo.dinoz.forEach(dinoz => {
		dinoz.setDataValue(
			'statusList',
			dinoz.status.map(status => status.statusId)
		);
		dinoz.setDataValue('status', undefined);
	});

	const infoToSend: PlayerInfo = {
		dinozCount: playerInfo.dinoz.length,
		rank: rank,
		pointCount: pointCount,
		subscribeAt: subscribe,
		clan: clan,
		playerName: playerInfo!.name,
		epicRewards: epicRewards,
		dinoz: playerInfo.dinoz,
		customText: playerInfo.customText
	};

	return res.status(200).send(infoToSend);
};

/**
 * @summary Import a specified account
 * @param req
 * @param req.body.server {string} Server where the player came from
 * @param res
 * @return void
 */
const importAccount = async (req: Request, res: Response): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	const playerId: number = req.user!.playerId!;
	const server: string = req.body.server;
	const importedData: Player | null = await getImportedData(playerId);

	//Check if player exist
	if (importedData === null) {
		return res.status(500).send(`Player ${playerId} doesn't exists`);
	}

	//Check if user has not already imported
	if (importedData.hasImported) {
		return res.status(500).send(`Player ${playerId} has already imported his account`);
	}

	//Check if user has data in Eternaltwin's API

	//Reset all data for this user except the user's row in tb_player
	await resetUser(playerId);

	//TODO Import from Eternaltwin's API
	const userET: string = importedData.eternalTwinId;

	//Give Epic Reward
	await addRewardToPlayer(playerId, 100);

	//Set hasImported to true
	await setHasImported(playerId, true);

	return res.status(200).send();
};

/**
 * @summary Set custom text for a player
 * @param req
 * @param req.body.message {string} Message to set as custom text
 * @param res
 * @return void
 */
const setCustomText = async (req: Request, res: Response): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	const playerId: number = req.user!.playerId!;
	const playerProfile: Player | null = await getPlayerRewardsRequest(playerId);

	//Check if player exist
	if (playerProfile === null) {
		return res.status(500).send(`Player ${playerId} doesn't exists`);
	}

	//Check if user can edit
	if (!playerProfile.reward.some(rewards => rewards.rewardId === rewardList.PLUME)) {
		return res.status(500).send(`Player ${playerId} cannot edit this field`);
	}
	await editCustomText(playerId, req.body.message);

	return res.status(200).send();
};

/**
 * @summary Fetch a list of player based on a string
 * @return Array<Player>
 * @param req
 * @param req.params.id {string}
 * @param res
 */
const searchPlayers = async (req: Request, res: Response): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	const playerList: Array<Player> = await searchPlayersByName(req.params.name);
	return res.status(200).send(playerList);
};

export { getCommonData, getAccountData, importAccount, setCustomText, searchPlayers };
