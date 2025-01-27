import cron from 'cron';
import { prisma } from '../prisma.js';
import dayjs from 'dayjs';
import { LOGGER } from '../context.js';
import { createTournament } from '../business/tournamentService.js';

const dojoResets = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 0 * * *', async () => {
		try {
			await prisma.dojoOpponents.deleteMany();
			await prisma.dojoTeam.deleteMany();
			await prisma.dojo.updateMany({
				data: {
					dailyReset: 0
				}
			});
			const latestTournament = await prisma.tournament.findFirst({
				orderBy: {
					date: 'desc'
				}
			});
			if (!latestTournament || dayjs().diff(latestTournament.date, 'weeks') >= 2) {
				const newTournament = await createTournament();
				LOGGER.log(`Created new tournament ${newTournament}`);
			}
		} catch (err) {
			console.error(`Cannot reset team and opponents team: ${err}`);
		}
	});
};

export { dojoResets };
