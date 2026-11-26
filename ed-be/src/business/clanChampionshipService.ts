import { ClanChampionshipDTO, ChampionshipForm } from '@drpg/core/models/clan/clanChampionship';
import { ClanChampionshipEventConfig } from '@drpg/core/models/clan/clanEventConfig';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { ClanEventType, Prisma } from '@drpg/prisma';
import { Request } from 'express';
import { DISCORD, LOGGER } from '../context.js';
import { scheduleJob } from '../utils/server/safeSchedule.js';
import { LocalTransactionClient, playerHasRightRequest } from '../dao/clansDao.js';
import { Auth, auth } from '../dao/playerDao.js';
import { prisma, PismaClientLocal } from '../prisma.js';
import { computeStandings, StandingBye } from '@drpg/core/utils/clanChampionshipStandings';
import { pairKey, pairSwissRound, swissRoundCount } from '../utils/clanChampionship/swiss.js';
import {
	computeMatchSlots,
	computeMatchSlotsFrom,
	computeRegistrationWindow,
	isMonday
} from '../utils/clanChampionship/schedule.js';
import { drawMatchPlace } from './clanChampionshipMatchService.js';
import { publishChampionshipChanged } from './clanChampionshipEvents.js';
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

type Slot = { startsAt: Date; endsAt: Date };
type Slots = Slot[];

type SwissHistory = { met: Set<string>; byes: Set<number>; homeCount: Map<number, number> };

/** Pairs one Swiss round, creates its matches, records the bye and draws the places of the round. */
async function createSwissRound(
	tx: LocalTransactionClient,
	eventId: string,
	places: ClanChampionshipEventConfig['places'],
	round: number,
	slot: Slot,
	clanNames: Map<number, string>,
	ranked: number[],
	history: SwissHistory
): Promise<void> {
	const { pairs, bye } = pairSwissRound({ ranked, ...history });
	await tx.clanChampionshipMatch.createMany({
		data: pairs.map(([homeClanId, awayClanId]) => ({
			eventId,
			round,
			homeClanId,
			awayClanId,
			homeClanName: clanNames.get(homeClanId) as string,
			awayClanName: clanNames.get(awayClanId) as string,
			startsAt: slot.startsAt,
			endsAt: slot.endsAt
		}))
	});
	if (bye !== null) {
		await tx.clanChampionshipRegistration.updateMany({
			where: { eventId, clanId: bye },
			data: { byeRounds: { push: round } }
		});
	}
	const created = await tx.clanChampionshipMatch.findMany({ where: { eventId, round } });
	for (const match of created) await drawMatchPlace(tx, match, places);
}

function byesOf(registrations: { clanId: number | null; clanName: string; byeRounds: number[] }[]): StandingBye[] {
	return registrations.flatMap(r => r.byeRounds.map(round => ({ round, clanId: r.clanId, clanName: r.clanName })));
}

/**
 * Sizes the Swiss championship, switches to running and draws round 0 (random order). The next rounds are drawn
 * by generateNextRound once the previous one is over, from the standings.
 */
async function createCalendar(
	tx: LocalTransactionClient,
	event: { id: string },
	config: ClanChampionshipEventConfig,
	registrations: { clanId: number | null; clanName: string }[],
	slotsFor: (roundCount: number) => Slots
): Promise<void> {
	const eventId = event.id;
	const clanNames = new Map<number, string>();
	for (const r of registrations) if (r.clanId !== null) clanNames.set(r.clanId, r.clanName);
	const rounds = swissRoundCount(clanNames.size);
	const slots = slotsFor(rounds);
	const running: ClanChampionshipEventConfig = {
		...config,
		phase: 'running',
		rounds,
		firstRoundStart: slots[0].startsAt.toISOString()
	};
	await tx.clanEvent.update({
		where: { id: eventId },
		data: { config: JSON.stringify(running), endDate: slots[slots.length - 1].endsAt }
	});
	await createSwissRound(tx, eventId, config.places, 0, slots[0], clanNames, shuffle([...clanNames.keys()]), {
		met: new Set(),
		byes: new Set(),
		homeCount: new Map()
	});
}

/**
 * Called by the tick once no match is left open: draws the next Swiss round from the standings (closest points,
 * no rematch when possible), or finishes the championship after its last round or when fewer than 2 clans are
 * left. Idempotent: no-op while a match is open or when the next round already exists. A round drawn after its
 * slot (server down) is shifted to start now, and the following rounds with it.
 */
export async function generateNextRound(eventId: string, now: Date = new Date()): Promise<void> {
	const changed = await prisma.$transaction(async tx => {
		await tx.$queryRaw`SELECT id FROM "ClanEvent" WHERE id = ${eventId}::uuid FOR UPDATE`;
		const event = await tx.clanEvent.findUnique({ where: { id: eventId } });
		if (!event) return false;
		const config = parseEventConfig(event) as ClanChampionshipEventConfig;
		if (config.phase !== 'running' || config.rounds === undefined || config.firstRoundStart === undefined) {
			return false;
		}
		const [registrations, matches] = await Promise.all([
			tx.clanChampionshipRegistration.findMany({ where: { eventId } }),
			tx.clanChampionshipMatch.findMany({ where: { eventId } })
		]);
		if (matches.some(m => m.status !== 'finished')) return false;

		const lastRound = Math.max(-1, ...matches.map(m => m.round), ...registrations.flatMap(r => r.byeRounds));
		const nextRound = lastRound + 1;
		const clanNames = new Map<number, string>();
		for (const r of registrations) if (r.clanId !== null) clanNames.set(r.clanId, r.clanName);

		if (nextRound >= config.rounds || clanNames.size < 2) {
			const endDate = event.endDate && event.endDate < now ? event.endDate : now;
			await tx.clanEvent.update({
				where: { id: eventId },
				data: { config: serializeConfig(config, 'finished'), endDate }
			});
			return true;
		}

		const byes = byesOf(registrations);
		const ranked = computeStandings(matches, byes)
			.map(row => row.clanId)
			.filter((id): id is number => id !== null && clanNames.has(id));
		for (const id of clanNames.keys()) if (!ranked.includes(id)) ranked.push(id);

		const history: SwissHistory = { met: new Set(), byes: new Set(), homeCount: new Map() };
		for (const m of matches) {
			if (m.homeClanId !== null && m.awayClanId !== null) history.met.add(pairKey(m.homeClanId, m.awayClanId));
			if (m.homeClanId !== null) history.homeCount.set(m.homeClanId, (history.homeCount.get(m.homeClanId) ?? 0) + 1);
		}
		for (const b of byes) if (b.clanId !== null) history.byes.add(b.clanId);

		let anchor = new Date(config.firstRoundStart);
		let slots = computeMatchSlotsFrom(anchor, config.rounds);
		const lateMs = now.getTime() - slots[nextRound].startsAt.getTime();
		if (lateMs > 0) {
			anchor = new Date(anchor.getTime() + lateMs);
			slots = computeMatchSlotsFrom(anchor, config.rounds);
			await tx.clanEvent.update({
				where: { id: eventId },
				data: {
					config: JSON.stringify({ ...config, firstRoundStart: anchor.toISOString() }),
					endDate: slots[slots.length - 1].endsAt
				}
			});
		}

		await createSwissRound(tx, eventId, config.places, nextRound, slots[nextRound], clanNames, ranked, history);
		return true;
	});
	if (changed) publishChampionshipChanged();
}

/**
 * Closes registrations (job at registrationEnd): cancels with fewer than 2 clans, otherwise sizes the
 * Swiss championship, draws round 0 and switches to running. No-op unless the phase is still `registration`.
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

		await createCalendar(tx, event, config, registrations, rounds =>
			computeMatchSlots(new Date(config.registrationEnd), rounds)
		);
	});
	publishChampionshipChanged();
}

/** running -> finished (called by the tick once every match of a round-robin championship is finished). */
export async function finishChampionship(eventId: string): Promise<void> {
	await prisma.$transaction(async tx => {
		await tx.$queryRaw`SELECT id FROM "ClanEvent" WHERE id = ${eventId}::uuid FOR UPDATE`;
		const event = await tx.clanEvent.findUnique({ where: { id: eventId } });
		if (!event) return;
		const config = parseEventConfig(event) as ClanChampionshipEventConfig;
		if (config.phase !== 'running') return;
		await tx.clanEvent.update({ where: { id: eventId }, data: { config: serializeConfig(config, 'finished') } });
	});
	publishChampionshipChanged();
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

/** True when the clan is registered to a championship whose matches are running (roster locked). */
export async function isClanInRunningChampionship(
	clanId: number,
	tx: PismaClientLocal | LocalTransactionClient = prisma
): Promise<boolean> {
	const event = await findActiveChampionshipEvent(tx);
	if (!event) return false;
	const config = parseEventConfig(event) as ClanChampionshipEventConfig;
	if (config.phase !== 'running') return false;
	const registration = await tx.clanChampionshipRegistration.findFirst({ where: { eventId: event.id, clanId } });
	return !!registration;
}

/**
 * True when the player took part in a match of the running championship: a Dinoz engaged on a board
 * (whatever its clan) or a fight they were part of. Such a player can no longer join a registered clan.
 */
export async function hasPlayerPlayedRunningChampionship(
	playerId: string,
	tx: PismaClientLocal | LocalTransactionClient = prisma
): Promise<boolean> {
	const event = await findActiveChampionshipEvent(tx);
	if (!event) return false;
	const config = parseEventConfig(event) as ClanChampionshipEventConfig;
	if (config.phase !== 'running') return false;
	const piece = await tx.clanChampionshipPiece.findFirst({
		where: { playerId, match: { eventId: event.id } },
		select: { id: true }
	});
	if (piece) return true;
	const fight = await tx.clanChampionshipFight.findFirst({
		where: { participantPlayerIds: { has: playerId }, match: { eventId: event.id } },
		select: { id: true }
	});
	return !!fight;
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

	publishChampionshipChanged();
	return { id: event.id };
}

/** Locks the active championship row and returns it with its parsed config, or throws noActive. */
async function lockActiveChampionship(tx: LocalTransactionClient, authed: { clanId: number | null }) {
	const active = await findActiveChampionshipEvent(tx);
	if (!active) throw new ExpectedError(translate('clanChampionship.noActive', authed as never));
	await tx.$queryRaw`SELECT id FROM "ClanEvent" WHERE id = ${active.id}::uuid FOR UPDATE`;
	const event = await tx.clanEvent.findUnique({ where: { id: active.id } });
	if (!event) throw new ExpectedError(translate('clanChampionship.noActive', authed as never));
	const config = parseEventConfig(event) as ClanChampionshipEventConfig;
	if (config.phase !== 'registration') {
		throw new ExpectedError(translate('clanChampionship.notInRegistration', authed as never));
	}
	return { event, config };
}

/** Admin: opens the registrations of the current championship right now (registrationEnd is unchanged). */
export async function openChampionshipRegistrations(req: Request): Promise<void> {
	const authed = await auth(req);
	await prisma.$transaction(async tx => {
		const { event } = await lockActiveChampionship(tx, authed);
		const now = new Date();
		if (event.startDate <= now) {
			throw new ExpectedError(translate('clanChampionship.registrationsAlreadyOpen', authed));
		}
		await tx.clanEvent.update({ where: { id: event.id }, data: { startDate: now } });
	});
	publishChampionshipChanged();
}

/**
 * Admin: closes the registrations now and starts day 1 immediately (next days keep the 48 h / J+3, J+7 rhythm).
 * Unlike the automatic closing, fewer than 2 clans is refused and the championship stays open.
 */
export async function startChampionshipMatches(req: Request): Promise<void> {
	const authed = await auth(req);
	await prisma.$transaction(async tx => {
		const { event, config } = await lockActiveChampionship(tx, authed);
		const registrations = await tx.clanChampionshipRegistration.findMany({ where: { eventId: event.id } });
		if (registrations.filter(r => r.clanId !== null).length < 2) {
			throw new ExpectedError(translate('clanChampionship.notEnoughClans', authed));
		}
		const now = new Date();
		await createCalendar(tx, event, { ...config, registrationEnd: now.toISOString() }, registrations, count =>
			computeMatchSlotsFrom(now, count)
		);
	});
	publishChampionshipChanged();
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

export async function registerClan(authed: Auth): Promise<void> {
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
	publishChampionshipChanged();
}

export async function unregisterClan(authed: Auth): Promise<void> {
	const clanId = await assertCanManageRegistration(authed);
	const event = await getOpenRegistrationEvent(authed);

	await prisma.$transaction(async tx => {
		await lockOpenRegistrationEvent(tx, event.id, authed);
		const { count } = await tx.clanChampionshipRegistration.deleteMany({ where: { eventId: event.id, clanId } });
		if (count === 0) {
			throw new ExpectedError(translate('clanChampionship.notRegistered', authed));
		}
	});
	publishChampionshipChanged();
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
			// The matches of a round share their start: break the tie on the clans, or the calendar reorders on each update
			orderBy: [
				{ round: 'asc' },
				{ startsAt: 'asc' },
				{ homeClanId: { sort: 'asc', nulls: 'last' } },
				{ awayClanId: { sort: 'asc', nulls: 'last' } },
				{ id: 'asc' }
			]
		})
	]);

	const canManageRegistration = authed.clanId
		? !!(await playerHasRightRequest(authed.clanId, authed.id, ClanMemberRight.WAR_OFFICER))
		: false;

	const isReaderClan = (m: { homeClanId: number | null; awayClanId: number | null }) =>
		!!authed.clanId && (m.homeClanId === authed.clanId || m.awayClanId === authed.clanId);

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
			placeId: m.status === 'scheduled' && !isReaderClan(m) ? null : m.placeId,
			status: m.status,
			homeScore: m.homeScore,
			awayScore: m.awayScore,
			winnerClanId: m.winnerClanId,
			startsAt: m.startsAt,
			endsAt: m.endsAt
		})),
		totalRounds: config.rounds ?? null,
		byes: byesOf(registrations).sort((a, b) => a.round - b.round),
		standings: computeStandings(matches, byesOf(registrations)),
		myClanRegistered: !!authed.clanId && registrations.some(r => r.clanId === authed.clanId),
		canManageRegistration
	};
}
