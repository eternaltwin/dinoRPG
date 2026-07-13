import { ServerAction } from '@drpg/prisma';
import { SseChannel } from '@drpg/core/models/serverEvents/SseChannel';
import { SseDataEnum } from '@drpg/core/models/serverEvents/SseData';
import { scheduleJob } from 'node-schedule';
import { prisma } from '../prisma.js';
import { LOGGER } from '../context.js';
import { eventState } from '../business/clanWar.js';
import { sendSseMessageToUserInChannel } from '../business/serverEventService.js';
import { applyProspectorUpdates, getProspectorRankings } from '../dao/clansDao.js';
import { computeProspectorUpdate } from '../utils/warCalculation.js';
import { computeNextProspectorRun } from '../utils/date.js';

/**
 * The Prospector inspects every clan castle during an active war event. A standing castle earns an
 * escalating reputation reward, a destroyed one an escalating penalty. It visits twice a day at a
 * random time inside a morning and an evening window, persisting its next visit in ServerState so
 * it resumes across reboots.
 */
const prospector = async () => {
	const nextRun = computeNextProspectorRun();
	try {
		const event = await eventState();
		if (event) {
			const rankings = await getProspectorRankings(event.id);
			const updates = rankings.map(r => computeProspectorUpdate(r, (r.clan.castle?.currentLife ?? 0) > 0));
			await applyProspectorUpdates(event.id, updates);

			for (let i = 0; i < rankings.length; i++) {
				const standing = (rankings[i].clan.castle?.currentLife ?? 0) > 0;
				const reputation = updates[i].reputation;
				for (const member of rankings[i].clan.members) {
					sendSseMessageToUserInChannel(member.playerId, SseChannel.NOTIFICATION, {
						type: SseDataEnum.CLAN_PROSPECTOR,
						prospector: { standing, reputation }
					});
				}
			}

			LOGGER.log(`Prospector visited ${updates.length} castle(s)`);
		}

		await prisma.serverState.upsert({
			where: { action: ServerAction.prospector },
			update: { nextCheck: nextRun },
			create: { action: ServerAction.prospector, nextCheck: nextRun }
		});
	} catch (err) {
		LOGGER.error(`Prospector visit failed: ${err}`);
	}
	scheduleJob('prospector', nextRun, () => prospector());
};

/**
 * Resumes the Prospector at boot: runs immediately if its persisted visit is missing or overdue,
 * otherwise reschedules it for the stored time.
 */
const scheduleProspector = async () => {
	const state = await prisma.serverState.findUnique({ where: { action: ServerAction.prospector } });
	if (!state || state.nextCheck < new Date()) {
		await prospector();
	} else {
		scheduleJob('prospector', state.nextCheck, () => prospector());
	}
};

export { prospector, scheduleProspector };
