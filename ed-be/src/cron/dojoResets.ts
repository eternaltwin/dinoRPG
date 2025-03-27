import dayjs from 'dayjs';
import { prisma } from '../prisma.js';
import { ServerAction } from '@drpg/prisma';

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
				nextCheck: dayjs().endOf('day').toDate()
			}
		});
	} catch (err) {
		console.error(`Cannot reset team and opponents team: ${err}`);
	}
};

export { dojoResets };
