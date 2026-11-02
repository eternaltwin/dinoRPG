import { ClanEventType } from '@drpg/prisma';
import { ClanEventConfig, ClanChampionshipEventConfig } from '@drpg/core/models/clan/clanEventConfig';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { prisma, PismaClientLocal } from '../prisma.js';
import translate from '../utils/server/translate.js';
import type { LocalTransactionClient } from '../dao/clansDao.js';

type Tx = PismaClientLocal | LocalTransactionClient;

/** War code must only ever see war events. */
export const WAR_EVENT_TYPES: ClanEventType[] = [ClanEventType.war, ClanEventType.mana_war];

export function parseEventConfig(event: { config: string }): ClanEventConfig {
	return JSON.parse(event.config) as ClanEventConfig;
}

/** War event in progress: startDate < now < endDate. */
export async function findActiveWarEvent(tx: Tx = prisma) {
	const now = new Date();
	return tx.clanEvent.findFirst({
		where: {
			AND: [{ endDate: { gt: now } }, { startDate: { lt: now } }],
			eventType: { in: WAR_EVENT_TYPES }
		}
	});
}

/** Latest championship that is still in registration or running phase. */
export async function findActiveChampionshipEvent(tx: Tx = prisma) {
	const event = await tx.clanEvent.findFirst({
		where: { eventType: ClanEventType.championship },
		orderBy: { startDate: 'desc' }
	});
	if (!event) return null;
	const config = parseEventConfig(event) as ClanChampionshipEventConfig;
	return config.phase === 'registration' || config.phase === 'running' ? event : null;
}

/** Shared advisory-lock key serialising every clan event creation (check + create must be atomic). */
export const CLAN_EVENT_CREATION_LOCK = 748201;

/** Takes the transaction-scoped advisory lock guarding clan event creation. */
export async function lockClanEventCreation(tx: LocalTransactionClient): Promise<void> {
	await tx.$executeRaw`SELECT pg_advisory_xact_lock(${CLAN_EVENT_CREATION_LOCK})`;
}

/** War and championship are exclusive: refuse any clan event overlapping or scheduled after `start`. */
export async function assertNoClanEventOverlap(start: Date, tx: Tx = prisma): Promise<void> {
	const other = await tx.clanEvent.findFirst({ where: { endDate: { gt: start } } });
	if (other || (await findActiveChampionshipEvent(tx))) {
		throw new ExpectedError(translate('clanEvent.overlap'));
	}
}
