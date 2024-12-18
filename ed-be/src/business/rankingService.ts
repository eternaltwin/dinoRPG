import { Request } from 'express';
import {
	getPlayerPositionDAO,
	getPlayersAverageRanking,
	getPlayersCompletionRanking,
	getPlayersSumRanking
} from '../dao/rankingDao.js';

/**
 * @summary Get all the players from a specified page to display their ranking
 * @param req
 * @param req.param.sort {string} between classic or average
 * @return Array<PlayerRanking>
 */
export async function getRanking(req: Request) {
	const page = +req.params.page;
	let playersRanking;

	switch (req.params.sort) {
		case 'classic':
			playersRanking = await getPlayersSumRanking(page);
			break;
		case 'average':
			playersRanking = await getPlayersAverageRanking(page);
			break;
		case 'completion':
			playersRanking = await getPlayersCompletionRanking(page);
			break;
		default:
			playersRanking = await getPlayersSumRanking(page);
			break;
	}

	return playersRanking;
}

export async function getPlayerPosition(req: Request) {
	const playerId = req.params.playerId;
	const playerPosition = await getPlayerPositionDAO(playerId);

	return playerPosition;
}
