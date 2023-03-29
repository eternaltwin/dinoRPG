import cron, { CronJob } from 'cron';
import { getPlayersPoints, updateRanking } from '../dao/rankingDao.js';
import { Ranking } from '../entity/ranking.js';
import { NewPositions } from '@drpg/core/models/player/NewPositions';

const updatePlayersPosition = (): CronJob => {
	const CronJob = cron.CronJob;

	return new CronJob('*/15 * * * *', async () => {
		try {
			const playersUpdated: Array<Ranking> = await getPlayersPoints();
			const newPositions: Array<NewPositions> = playersUpdated
				.sort((a, b) => b.sumPoints - a.sumPoints)
				.map((line, index) => {
					return {
						id: line.player.id,
						sumPosition: index + 1,
						averagePosition: 0,
						sumPointsDisplayed: line.sumPoints,
						averagePointsDisplayed: line.averagePoints,
						dinozCountDisplayed: line.dinozCount
					};
				});

			playersUpdated
				.sort((a, b) => b.averagePoints - a.averagePoints)
				.forEach((line, index) => {
					newPositions.find(players => players.id === line.player.id)!.averagePosition = index + 1;
				});

			newPositions.forEach(async player => await updateRanking(player));
			console.log('Ranking updated');
		} catch (err) {
			console.error('Cannot update table ranking');
		}
	});
};

export { updatePlayersPosition };
