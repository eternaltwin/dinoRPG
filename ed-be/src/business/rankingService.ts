import { Request } from 'express';
import {
	getPlayerPositionDAO,
	getPlayersAverageRanking,
	getPlayersCompletionRanking,
	getPlayersDojoRanking,
	getPlayersSumRanking
} from '../dao/rankingDao.js';
import { getEveryStatTop3 } from '../dao/trackingDao.js';
import { getWarHistory } from '../dao/clansDao.js';

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
		case 'dojo':
			const rank = await getPlayersDojoRanking(page);
			playersRanking = rank.map(p => {
				const victory = p.player?.Dojo?.DojoChallengeHistory.filter(h => h.victory).length ?? 0;
				const totalMatch = p.player?.Dojo?.DojoChallengeHistory.length ?? 0;
				const worth = victory / totalMatch;
				return {
					dojo: p.dojo,
					player: {
						id: p.player?.id,
						name: p.player?.name,
						worth: Math.trunc(worth * 10000) / 100
					}
				};
			});
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

export async function getStatRankings() {
	return getEveryStatTop3();
}

export async function getWarHistoryRanking(req: Request) {
	const page = +req.params.page || 1;
	return getWarHistory(page);
}
