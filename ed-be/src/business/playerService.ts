import { Request, Response } from 'express';
import { getDinozTotalCount } from '../dao/dinozDao.js';
import { validationResult } from 'express-validator';
import {
	getCommonDataRequest,
	getPlayerDataRequest
} from '../dao/playerDao.js';

import { Player, PlayerInfo } from '../models/index.js';

const getCommonData = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const commonData: Player | null = await getCommonDataRequest(
		req.user!.playerId!
	);
	commonData?.setDataValue('dinozCount', await getDinozTotalCount());
	return res.status(200).send(commonData);
};

const getAccountData = async (
	req: Request,
	res: Response
): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	const playerId: number = parseInt(req.params.id);
	const playerInfo: Player | null = await getPlayerDataRequest(playerId);

	if (playerInfo === null) {
		return res.status(500).send(`Player ${playerId} doesn't exists`);
	}

	// Rank TODO
	const rank: number = 1;

	// Compte du nombre de point
	const pointCount: number = playerInfo.dinoz.reduce(
		(acc, dinoz) => (acc += dinoz.level),
		0
	);

	// Subscription date
	const date = playerInfo.createdAt.toLocaleString().split(',')[0].split('/');
	const formatter = new Intl.DateTimeFormat('fr', { month: 'long' });
	const month = formatter.format(
		new Date(parseInt(date[2]), parseInt(date[0]) - 1, parseInt(date[1]))
	);
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
		dinoz: playerInfo.dinoz
	};

	return res.status(200).send(infoToSend);
};

export { getCommonData, getAccountData };
