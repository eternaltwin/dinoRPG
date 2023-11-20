import cron from 'cron';
import { getPlayersPoints, updateRanking } from '../dao/rankingDao.js';

const updatePlayersPosition = () => {
	const CronJob = cron.CronJob;

	return new CronJob('*/15 * * * *', async () => {
		try {
			const playersUpdated = await getPlayersPoints();
			const newPositions = playersUpdated
				.sort((a, b) => b.sumPoints - a.sumPoints)
				.map((line, index) => {
					if (!line.player) throw new Error('Player not found');

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
					const linePlayer = line.player;
					if (!linePlayer) throw new Error('Player not found');
					const player = newPositions.find(players => players.id === linePlayer.id);

					if (!player) throw new Error('Player not found');

					player.averagePosition = index + 1;
				});

			newPositions.forEach(async ranking => await updateRanking(ranking.id, ranking));
			console.log('Ranking updated');
		} catch (err) {
			console.error('Cannot update table ranking');
		}
	});
};

export { updatePlayersPosition };
