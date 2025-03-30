import dayjs from 'dayjs';
import { prisma } from '../prisma.js';
import { ServerAction } from '@drpg/prisma';
import { LOGGER } from '../context.js';
import { scheduleJob } from 'node-schedule';

const dojoResets = async () => {
	try {
		await prisma.dojoOpponents.deleteMany();
		await prisma.dojoTeam.deleteMany();
		await prisma.dojo.updateMany({
			data: {
				dailyReset: 0
			}
		});
		await prisma.serverState.update({
			where: {
				action: ServerAction.dojoReset
			},
			data: {
				nextCheck: dayjs().add(1, 'day').startOf('day').toDate()
			}
		});
		scheduleJob('dojoReset', dayjs().add(1, 'day').startOf('day').toDate(), () => dojoResets());
	} catch (err) {
		LOGGER.error(`Cannot reset team and opponents team: ${err}`);
	}
};

export { dojoResets };
