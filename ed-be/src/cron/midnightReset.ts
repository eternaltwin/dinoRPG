import dayjs from 'dayjs';
import { prisma } from '../prisma.js';
import { $Enums, ServerAction } from '@drpg/prisma';
import { LOGGER } from '../context.js';
import { scheduleJob } from 'node-schedule';
import UnavailableReason = $Enums.UnavailableReason;

const midnightReset = async () => {
	const tommorow = dayjs().add(1, 'day').startOf('day').toDate();
	try {
		// Unfreeze dinoz
		await prisma.dinoz.updateMany({
			where: {
				unavailableReason: UnavailableReason.unfreezing
			},
			data: {
				unavailableReason: null
			}
		});
		await prisma.serverState.update({
			where: {
				action: ServerAction.midnightReset
			},
			data: {
				nextCheck: tommorow
			}
		});
		scheduleJob('midnightReset', tommorow, () => midnightReset());
	} catch (err) {
		LOGGER.error(`Cannot perform midnight actions: ${err}`);
	}
};

export { midnightReset };
