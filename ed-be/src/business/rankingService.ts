import { Request } from 'express';
import { getPlayersSumRanking, getPlayersAverageRanking } from '../dao/rankingDao.js';
import { PlayerRanking } from '@drpg/core/models/player/PlayerRanking';
import { Ranking } from '../entity/index.js';

/**
 * @summary Get all the players from a specified page to display their ranking
 * @param req
 * @param req.param.sort {string} between classic or average
 * @return Array<PlayerRanking>
 */
export async function getRanking(req: Request): Promise<Array<PlayerRanking>> {
	const page: number = parseInt(req.params.page);
	let playersRanking: Array<Ranking>;

	switch (req.params.sort) {
		case 'classic':
			playersRanking = await getPlayersSumRanking(page);
			break;
		case 'average':
			playersRanking = await getPlayersAverageRanking(page);
			break;
		default:
			playersRanking = await getPlayersSumRanking(page);
			break;
	}

	const infoToSend: Array<PlayerRanking> = playersRanking.map(player => {
		return {
			dinozCount: player.dinozCountDisplayed,
			pointCount: player.sumPointsDisplayed,
			playerName: player.player.name,
			playerId: player.player.id,
			pointAverage: player.averagePointsDisplayed,
			position: player.sumPosition || player.averagePosition
		};
	});

	return infoToSend;
}
