import { ClanChampionshipDTO, ChampionshipForm } from '@drpg/core/models/clan/clanChampionship';
import { ClanChampionshipEventConfig } from '@drpg/core/models/clan/clanEventConfig';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { ClanEventType, Prisma } from '@drpg/prisma';
import { Request } from 'express';
import { DISCORD, LOGGER } from '../context.js';
import { scheduleJob } from 'node-schedule';
import { LocalTransactionClient, playerHasRightRequest } from '../dao/clansDao.js';
import { auth } from '../dao/playerDao.js';
import { prisma, PismaClientLocal } from '../prisma.js';
import { roundRobin } from '../utils/clanChampionship/roundRobin.js';
import { computeMatchSlots, computeRegistrationWindow, isMonday } from '../utils/clanChampionship/schedule.js';
import { drawMatchPlace } from './clanChampionshipMatchService.js';
import { shuffle } from '../utils/tools.js';
import translate from '../utils/server/translate.js';
import {
	assertNoClanEventOverlap,
	findActiveChampionshipEvent,
	findVisibleChampionshipEvent,
	lockClanEventCreation,
	parseEventConfig
} from './clanEventService.js';


/** Wraps a scheduled job so a failure is reported instead of becoming an unhandled rejection. */
export function runChampionshipJob(name: string, fn: () => Promise<void>): () => Promise<void> {
	return async () => {
		try {
			await fn();
		} catch (error) {
			LOGGER.error(error);
			const wrapped = new Error(`Championship job ${name} failed: ${(error as Error)?.message}`);
			DISCORD.sendError(Object.assign(wrapped, { cause: error }));
		}
	};
}

function serializeConfig(config: ClanChampionshipEventConfig, phase: ClanChampionshipEventConfig['phase']): string {
	return JSON.stringify({ ...config, phase });
}

/**
 * Closes registrations (job at registrationEnd): cancels with fewer than 2 clans, otherwise builds
 * the round-robin calendar and switches to running. No-op unless the phase is still `registration`.
 */
export async function closeRegistrations(eventId: string): Promise<void> {
	await prisma.$transaction(async tx => {
		await tx.$queryRaw`SELECT id FROM "ClanEvent" WHERE id = ${eventId}::uuid FOR UPDATE`;
		const event = await tx.clanEvent.findUnique({ where: { id: eventId } });
		if (!event) return;
		const config = parseEventConfig(event) as ClanChampionshipEventConfig;
		if (config.phase !== 'registration') return;

		const registrations = await tx.clanChampionshipRegistration.findMany({ where: { eventId } });
		if (registrations.filter(r => r.clanId !== null).length < 2) {
			await tx.clanEvent.update({
				where: { id: eventId },
				data: { config: serializeConfig(config, 'cancelled'), endDate: new Date() }
			});
			return;
		}

		const clanNames = new Map<number, string>();
		for (const r of registrations) if (r.clanId !== null) clanNames.set(r.clanId, r.clanName);
		const rounds = roundRobin(shuffle([...clanNames.keys()]));
		const slots = computeMatchSlots(new Date(config.registrationEnd), rounds.length);
		await tx.clanChampionshipMatch.createMany({
			data: rounds.flatMap((pairs, round) =>
				pairs.map(([homeClanId, awayClanId]) => ({
					eventId,
					round,
					homeClanId,
					awayClanId,
					homeClanName: clanNames.get(homeClanId) as string,
					awayClanName: clanNames.get(awayClanId) as string,
					startsAt: slots[round].startsAt,
					endsAt: slots[round].endsAt
				}))
			)
		});
		const endDate = slots[slots.length - 1].endsAt;
		await tx.clanEvent.update({
			where: { id: eventId },
			data: { config: serializeConfig(config, 'running'), endDate }
		});
		const firstRound = await tx.clanChampionshipMatch.findMany({ where: { eventId, round: 0 } });
		for (const match of firstRound) await drawMatchPlace(tx, match, config.places);
	});
}

/** running -> finished (called by the tick once every match is finished). */
export async function finishChampionship(eventId: string): Promise<void> {
	await prisma.$transaction(async tx => {
		await tx.$queryRaw`SELECT id FROM "ClanEvent" WHERE id = ${eventId}::uuid FOR UPDATE`;
		const event = await tx.clanEvent.findUnique({ where: { id: eventId } });
		if (!event) return;
		const config = parseEventConfig(event) as ClanChampionshipEventConfig;
		if (config.phase !== 'running') return;
		await tx.clanEvent.update({ where: { id: eventId }, data: { config: serializeConfig(config, 'finished') } });
	});
}

/** Boot: re-arm (or run now if overdue) the close job of the active championship. */
export async function scheduleClanChampionship(): Promise<void> {
	const event = await findActiveChampionshipEvent();
	if (!event) return;
	const config = parseEventConfig(event) as ClanChampionshipEventConfig;
	const now = new Date();

	if (config.phase === 'registration') {
		const end = new Date(config.registrationEnd);
		if (end <= now) await runChampionshipJob(`championshipClose_${event.id}`, () => closeRegistrations(event.id))();
		else
			scheduleJob(
				`championshipClose_${event.id}`,
				end,
				runChampionshipJob(`championshipClose_${event.id}`, () => closeRegistrations(event.id))
			);
	}
}

/** True when the clan is registered to the active (registration or running) championship. */
export async function isClanInActiveChampionship(
	clanId: number,
	tx: PismaClientLocal | LocalTransactionClient = prisma
) {
	const event = await findActiveChampionshipEvent(tx);
	if (!event) return false;
	const registration = await tx.clanChampionshipRegistration.findFirst({ where: { eventId: event.id, clanId } });
	return !!registration;
}

export async function startClanChampionship(req: Request): Promise<{ id: string }> {
	const authed = await auth(req);
	const { start, places } = req.body as ChampionshipForm;

	if (typeof start !== 'string' || !isMonday(start)) {
		throw new ExpectedError(translate('clanChampionship.notMonday', authed));
	}
	const { registrationStart, registrationEnd } = computeRegistrationWindow(start);

	const now = new Date();
	const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	if (registrationStart < todayStart) {
		throw new ExpectedError(translate('clanChampionship.startInPast', authed));
	}

	const championshipPlaces = (Array.isArray(places) ? places : [])
		.filter(p => Object.values(PlaceEnum).includes(p))
		.map(p => p as PlaceEnum);
	if (championshipPlaces.length === 0) {
		throw new ExpectedError(translate('clanChampionship.noPlaces', authed));
	}

	const config: ClanChampionshipEventConfig = {
		eventType: ClanEventType.championship,
		places: championshipPlaces,
		registrationEnd: registrationEnd.toISOString(),
		phase: 'registration'
	};
	const event = await prisma.$transaction(async tx => {
		await lockClanEventCreation(tx);
		await assertNoClanEventOverlap(registrationStart, tx);
		return tx.clanEvent.create({
			data: {
				eventType: ClanEventType.championship,
				startDate: registrationStart,
				endDate: registrationEnd,
				config: JSON.stringify(config)
			}
		});
	});

	scheduleJob(
		`championshipClose_${event.id}`,
		registrationEnd,
		runChampionshipJob(`championshipClose_${event.id}`, () => closeRegistrations(event.id))
	);

	return { id: event.id };
}

function isOpenForRegistration(event: { config: string; startDate: Date }): boolean {
	const config = parseEventConfig(event) as ClanChampionshipEventConfig;
	const now = new Date();
	return config.phase === 'registration' && now >= event.startDate && now < new Date(config.registrationEnd);
}

/** Active championship still open to (un)registration, or throws. */
async function getOpenRegistrationEvent(authed: { clanId: number | null }) {
	const event = await findActiveChampionshipEvent();
	if (event && isOpenForRegistration(event)) return event;
	throw new ExpectedError(translate('clanChampionship.notInRegistration', authed as never));
}

/**
 * Locks the championship event row (serialises with the closing job) and re-validates, inside the
 * transaction, that registrations are still open. Throws notInRegistration otherwise.
 */
export async function lockOpenRegistrationEvent(
	tx: LocalTransactionClient,
	eventId: string,
	authed: { clanId: number | null }
) {
	await tx.$queryRaw`SELECT id FROM "ClanEvent" WHERE id = ${eventId}::uuid FOR UPDATE`;
	const event = await tx.clanEvent.findUnique({ where: { id: eventId } });
	if (!event || !isOpenForRegistration(event)) {
		throw new ExpectedError(translate('clanChampionship.notInRegistration', authed as never));
	}
	return event;
}

async function assertCanManageRegistration(authed: { id: string; clanId: number | null }): Promise<number> {
	if (!authed.clanId) {
		throw new ExpectedError(translate('noClan', authed as never));
	}
	if (!(await playerHasRightRequest(authed.clanId, authed.id, ClanMemberRight.WAR_OFFICER))) {
		throw new ExpectedError(translate('noRight', authed as never));
	}
	return authed.clanId;
}

export async function registerClan(req: Request): Promise<void> {
	const authed = await auth(req);
	const clanId = await assertCanManageRegistration(authed);
	const event = await getOpenRegistrationEvent(authed);

	await prisma.$transaction(async tx => {
		await lockOpenRegistrationEvent(tx, event.id, authed);
		const war = await tx.clanWar.findFirst({
			where: { winnerClanId: null, OR: [{ attackerClanId: clanId }, { defenderClanId: clanId }] }
		});
		if (war) {
			throw new ExpectedError(translate('clanChampionship.clanAtWar', authed));
		}
		const { name: clanName } = await tx.clan.findUniqueOrThrow({ where: { id: clanId }, select: { name: true } });
		try {
			await tx.clanChampionshipRegistration.create({
				data: { eventId: event.id, clanId, clanName, registeredById: authed.id }
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				throw new ExpectedError(translate('clanChampionship.alreadyRegistered', authed));
			}
			throw error;
		}
	});
}

export async function unregisterClan(req: Request): Promise<void> {
	const authed = await auth(req);
	const clanId = await assertCanManageRegistration(authed);
	const event = await getOpenRegistrationEvent(authed);

	await prisma.$transaction(async tx => {
		await lockOpenRegistrationEvent(tx, event.id, authed);
		const { count } = await tx.clanChampionshipRegistration.deleteMany({ where: { eventId: event.id, clanId } });
		if (count === 0) {
			throw new ExpectedError(translate('clanChampionship.notRegistered', authed));
		}
	});
}

export async function getCurrentChampionship(req: Request): Promise<ClanChampionshipDTO | null> {
	const authed = await auth(req);

	const event = await findVisibleChampionshipEvent();
	if (!event) return null;

	const config = parseEventConfig(event) as ClanChampionshipEventConfig;
	const [registrations, matches] = await Promise.all([
		prisma.clanChampionshipRegistration.findMany({
			where: { eventId: event.id },
			orderBy: { registeredAt: 'asc' }
		}),
		prisma.clanChampionshipMatch.findMany({
			where: { eventId: event.id },
			orderBy: [{ round: 'asc' }, { startsAt: 'asc' }]
		})
	]);

	const canManageRegistration = authed.clanId
		? !!(await playerHasRightRequest(authed.clanId, authed.id, ClanMemberRight.WAR_OFFICER))
		: false;

	return {
		id: event.id,
		phase: config.phase,
		registrationStart: event.startDate,
		registrationEnd: new Date(config.registrationEnd),
		endDate: event.endDate as Date,
		places: config.places,
		registrations: registrations.map(r => ({ clanId: r.clanId, clanName: r.clanName })),
		matches: matches.map(m => ({
			id: m.id,
			round: m.round,
			homeClan: { id: m.homeClanId, name: m.homeClanName },
			awayClan: { id: m.awayClanId, name: m.awayClanName },
			placeId: m.placeId,
			status: m.status,
			homeScore: m.homeScore,
			awayScore: m.awayScore,
			winnerClanId: m.winnerClanId,
			startsAt: m.startsAt,
			endsAt: m.endsAt
		})),
		myClanRegistered: !!authed.clanId && registrations.some(r => r.clanId === authed.clanId),
		canManageRegistration
	};
}
