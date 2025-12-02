import { prisma } from '../prisma.js';
import { ServerAction } from '@drpg/prisma';
import { scheduleJob } from 'node-schedule';
import { dojoResets } from '../cron/dojoResets.js';
import dayjs from 'dayjs';
import {midnightReset} from "../cron/midnightReset.js";

export async function scheduleAtStart() {
	const actions = await prisma.serverState.findMany();
	for (const action of actions) {
		switch (action.action) {
			case ServerAction.dojoReset:
				if (action.nextCheck < new Date()) {
					await dojoResets();
				} else {
					scheduleJob(action.action, dayjs().add(1, 'day').startOf('day').toDate(), () => dojoResets());
				}
				break;
			case ServerAction.midnightReset:
				if (action.nextCheck < new Date()) {
					await midnightReset();
				} else {
					scheduleJob(action.action, dayjs().add(1, 'day').startOf('day').toDate(), () => midnightReset());
				}
				break
			default:
				//TODO all other ServerAction
				break;
		}
	}
}
