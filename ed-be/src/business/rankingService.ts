import { Request } from 'express';
import { getPlayersAverageRanking, getPlayersSumRanking } from '../dao/rankingDao.js';

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
			const data = await getPlayersSumRanking(page);
			playersRanking = data.map(ranking => {
				if (!ranking.player) {
					throw new Error('Player not found');
				}

				return {
					dinozCount: ranking.dinozCountDisplayed,
					pointCount: ranking.sumPointsDisplayed,
					playerName: ranking.player.name,
					playerId: ranking.player.id,
					pointAverage: ranking.averagePointsDisplayed,
					position: ranking.sumPosition
				};
			});
			break;
		case 'average':
			const data2 = await getPlayersAverageRanking(page);
			playersRanking = data2.map(ranking => {
				if (!ranking.player) {
					throw new Error('Player not found');
				}

				return {
					dinozCount: ranking.dinozCountDisplayed,
					pointCount: ranking.sumPointsDisplayed,
					playerName: ranking.player.name,
					playerId: ranking.player.id,
					pointAverage: ranking.averagePointsDisplayed,
					position: ranking.averagePosition
				};
			});
			break;
		default:
			const data3 = await getPlayersSumRanking(page);
			playersRanking = data3.map(ranking => {
				if (!ranking.player) {
					throw new Error('Player not found');
				}

				return {
					dinozCount: ranking.dinozCountDisplayed,
					pointCount: ranking.sumPointsDisplayed,
					playerName: ranking.player.name,
					playerId: ranking.player.id,
					pointAverage: ranking.averagePointsDisplayed,
					position: ranking.sumPosition
				};
			});
			break;
	}

	return playersRanking;
}
