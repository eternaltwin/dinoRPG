import cron from 'cron';
import { prisma } from '../prisma.js';

const dojoResets = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 0 * * *', async () => {
		try {
			await prisma.dojoOpponents.deleteMany();
			await prisma.dojoTeam.deleteMany();
		} catch (err) {
			console.error(`Cannot reset team and opponents team: ${err}`);
		}
	});
};

export { dojoResets };
