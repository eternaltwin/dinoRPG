import { prisma } from '../prisma.js';
import { ServerAction } from '@drpg/prisma';
import { scheduleJob } from 'node-schedule';
import dayjs from 'dayjs';
import { midnightReset } from '../cron/midnightReset.js';
import { healRestingDinoz } from '../cron/healRestingDinoz.js';

export async function scheduleAtStart() {
	const actions = await prisma.serverState.findMany();
	for (const action of actions) {
		switch (action.action) {
			case ServerAction.healRestingDinoz:
				if (action.nextCheck < new Date()) {
					await healRestingDinoz();
				} else {
					scheduleJob(action.action, action.nextCheck, () => healRestingDinoz());
				}
				break;
			case ServerAction.midnightReset:
				if (action.nextCheck < new Date()) {
					await midnightReset();
				} else {
					scheduleJob(action.action, dayjs().add(1, 'day').startOf('day').toDate(), () => midnightReset());
				}
				break;
			default:
				//TODO all other ServerAction
				break;
		}
	}
}
