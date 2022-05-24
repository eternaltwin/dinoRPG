import cron, { CronJob } from 'cron';
import { getPlayersPoints, updateRanking } from '../dao/rankingDao.js';
import { NewPositions, Ranking } from '../models/index.js';

const updatePlayersPosition = (): CronJob => {
	const CronJob = cron.CronJob;

	return new CronJob('*/15 * * * *', async () => {
		try {
			const playersUpdated: Array<Ranking> = await getPlayersPoints();
			const newPositions: Array<NewPositions> = playersUpdated
				.sort((a, b) => b.sumPoints - a.sumPoints)
				.map((line, index) => {
					return {
						playerId: line.playerId,
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
					newPositions.find(players => players.playerId === line.playerId)!.averagePosition = index + 1;
				});

			newPositions.forEach(async player => await updateRanking(player));
			console.log('Ranking updated');
		} catch (err) {
			console.error('Cannot update table tb_ranking');
		}
	});
};

export { updatePlayersPosition };
