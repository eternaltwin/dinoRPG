import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
	getPlayersSumRanking,
	getPlayersAverageRanking
} from '../dao/rankingDao.js';
import { PlayerRanking, Ranking } from '../models';

/**
 * Get all the players from a specified page to display their ranking
 * @param req
 * @param req.param.sort : string between classic or average
 * @param res
 */
const getRanking = async (req: Request, res: Response): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	const page: number = parseInt(req.params.page);
	let PlayersRanking: Array<Ranking>;

	switch (req.params.sort) {
		case 'classic':
			PlayersRanking = await getPlayersSumRanking(page);
			break;
		case 'average':
			PlayersRanking = await getPlayersAverageRanking(page);
			break;
		default:
			PlayersRanking = await getPlayersSumRanking(page);
			break;
	}
	const infoToSend: Array<PlayerRanking> = PlayersRanking.map(player => {
		return {
			dinozCount: player.dinozCountDisplayed,
			pointCount: player.sumPointsDisplayed,
			playerName: player.player.name,
			playerId: player.playerId,
			pointAverage: player.averagePointsDisplayed,
			position: player.sumPosition || player.averagePosition
		};
	});
	return res.status(200).send(infoToSend);
};

export { getRanking };
