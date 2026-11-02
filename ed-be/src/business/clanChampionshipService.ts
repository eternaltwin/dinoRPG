import { ClanChampionshipDTO, ChampionshipForm } from '@drpg/core/models/clan/clanChampionship';
import { ClanChampionshipEventConfig } from '@drpg/core/models/clan/clanEventConfig';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { ClanEventType, Prisma } from '@drpg/prisma';
import { Request } from 'express';
import { scheduleJob } from 'node-schedule';
import { LocalTransactionClient, playerHasRightRequest } from '../dao/clansDao.js';
import { auth } from '../dao/playerDao.js';
import { prisma } from '../prisma.js';
import { computeRegistrationWindow, isMonday } from '../utils/clanChampionship/schedule.js';
import translate from '../utils/server/translate.js';
import { assertNoClanEventOverlap, findActiveChampionshipEvent, parseEventConfig } from './clanEventService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const RESULT_VISIBLE_DAYS = 7;

// Placeholder: Task 5 implements the closing of registrations (cancel or build the calendar).
export async function closeRegistrations(eventId: string): Promise<void> {
	void eventId;
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

	await assertNoClanEventOverlap(registrationStart);

	const config: ClanChampionshipEventConfig = {
		eventType: ClanEventType.championship,
		places: championshipPlaces,
		registrationEnd: registrationEnd.toISOString(),
		phase: 'registration'
	};
	const event = await prisma.clanEvent.create({
		data: {
			eventType: ClanEventType.championship,
			startDate: registrationStart,
			endDate: registrationEnd,
			config: JSON.stringify(config)
		}
	});

	scheduleJob(`championshipClose_${event.id}`, registrationEnd, () => closeRegistrations(event.id));

	return { id: event.id };
}

function isOpenForRegistration(event: { config: string }): boolean {
	const config = parseEventConfig(event) as ClanChampionshipEventConfig;
	return config.phase === 'registration' && new Date() < new Date(config.registrationEnd);
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
		try {
			await tx.clanChampionshipRegistration.create({
				data: { eventId: event.id, clanId, registeredById: authed.id }
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

	let event = await findActiveChampionshipEvent();
	if (!event) {
		const latest = await prisma.clanEvent.findFirst({
			where: { eventType: ClanEventType.championship },
			orderBy: { startDate: 'desc' }
		});
		if (latest && latest.endDate && latest.endDate.getTime() > Date.now() - RESULT_VISIBLE_DAYS * DAY_MS) {
			event = latest;
		}
	}
	if (!event) return null;

	const config = parseEventConfig(event) as ClanChampionshipEventConfig;
	const [registrations, matches] = await Promise.all([
		prisma.clanChampionshipRegistration.findMany({
			where: { eventId: event.id },
			include: { clan: { select: { name: true } } },
			orderBy: { registeredAt: 'asc' }
		}),
		prisma.clanChampionshipMatch.findMany({
			where: { eventId: event.id },
			include: { homeClan: { select: { id: true, name: true } }, awayClan: { select: { id: true, name: true } } },
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
		registrations: registrations.map(r => ({ clanId: r.clanId, clanName: r.clan.name })),
		matches: matches.map(m => ({
			id: m.id,
			round: m.round,
			homeClan: m.homeClan,
			awayClan: m.awayClan,
			startsAt: m.startsAt,
			endsAt: m.endsAt
		})),
		myClanRegistered: !!authed.clanId && registrations.some(r => r.clanId === authed.clanId),
		canManageRegistration
	};
}
