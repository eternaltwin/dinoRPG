import cron from 'cron';
import { prisma } from '../prisma.js';
import { LOGGER } from '../context.js';
import TournamentManager from '../utils/tournamentManager.js';
import { scheduledJobs } from 'node-schedule';
import dayjs from 'dayjs';

const tournamentCron = () => {
	const CronJob = cron.CronJob;

	return new CronJob('*/10 * * * * *', async () => {
		// const currentDate = dayjs();
		// const nextMonth = currentDate.add(30, 'days');
		// console.log(currentDate.toDate(), nextMonth.toDate());
		// console.log(scheduledJobs['582765d1-2c90-4b9d-8ca4-7e09e74d93e2'].nextInvocation())
	});
};

export { tournamentCron };
