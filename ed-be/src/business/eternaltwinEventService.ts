import { isUuid } from '@drpg/core/utils/isUuid';
import { EternaltwinNodeClient } from '@eternaltwin/client-node';
import { timingSafeEqual } from 'node:crypto';
import { GLOBAL, LOGGER } from '../context.js';
import { getToken } from '../dao/eternaltwinTokenDao.js';
import { archiveOldUsername, getPlayerName, setPlayer, updateUsernameOnRelatedTables } from '../dao/playerDao.js';

/**
 * Kinds of user events Eternaltwin posts to our `event_stream_uri`.
 *
 * The list is open: Eternaltwin may add kinds, which we drop.
 */
export enum EternaltwinEventKind {
	UserUpdated = 'UserUpdated',
	UserDisabled = 'UserDisabled',
	UserEnabled = 'UserEnabled'
}

/**
 * A user event, as Eternaltwin posts it.
 *
 * `@eternaltwin/core` describes it as `UserStoreEvent` from 0.17.1 on, which is not on npm yet: the
 * body is read by hand until then.
 */
export interface EternaltwinEvent {
	event: EternaltwinEventKind;
	id: string;
	time: Date;
	user: { type: 'User'; id: string };
}

/**
 * Whether the `Authorization` header is the one Eternaltwin signs its events with:
 * Basic `eternaltwin.<server channel>:<client secret>`.
 */
export function isEternaltwinAuthorization(authorization: string | undefined): boolean {
	const { serverChannel, secret } = GLOBAL.config.eternaltwin;
	const expected = Buffer.from('Basic ' + Buffer.from(`eternaltwin.${serverChannel}:${secret}`).toString('base64'));
	const got = Buffer.from(authorization ?? '');
	return got.length === expected.length && timingSafeEqual(got, expected);
}

/**
 * Read a parsed request body as an event, or `null` for an unknown kind or an invalid body.
 */
export function readEternaltwinEvent(body: unknown): EternaltwinEvent | null {
	if (typeof body !== 'object' || body === null) {
		return null;
	}
	const { event, id, time, user } = body as Record<string, unknown>;
	if (!Object.values<unknown>(EternaltwinEventKind).includes(event)) {
		return null;
	}
	if (typeof id !== 'string' || !isUuid(id) || typeof time !== 'string') {
		return null;
	}
	const date = new Date(time);
	if (Number.isNaN(date.getTime())) {
		return null;
	}
	if (typeof user !== 'object' || user === null) {
		return null;
	}
	const { type, id: userId } = user as Record<string, unknown>;
	if (type !== 'User' || typeof userId !== 'string' || !isUuid(userId)) {
		return null;
	}
	return { event: event as EternaltwinEventKind, id, time: date, user: { type, id: userId } };
}

/**
 * Give a player their new Eternaltwin display name, everywhere it is copied.
 */
export async function renamePlayer(playerId: string, oldName: string, newName: string) {
	await setPlayer(playerId, { name: newName });
	await archiveOldUsername(playerId, oldName);
	await updateUsernameOnRelatedTables(playerId, newName);
}

/**
 * Apply an event.
 *
 * The event only says which user changed, so the user is read back from Eternaltwin: this makes the
 * handler idempotent, and indifferent to events arriving twice or out of order. Events are not
 * retried when they fail, so the sync done at sign-in stays.
 */
export async function handleEternaltwinEvent(event: EternaltwinEvent): Promise<void> {
	const userId = event.user.id;
	switch (event.event) {
		case EternaltwinEventKind.UserUpdated: {
			const player = await getPlayerName(userId);
			const token = await getToken(userId);
			if (player === null || token === null) {
				// Never played, or no token to read the user with: the next sign-in syncs them.
				return;
			}
			const eternaltwin = new EternaltwinNodeClient(new URL(GLOBAL.config.eternaltwin.url));
			const user = await eternaltwin.getUserById({ userId, auth: token.accessToken });
			const name = user.displayName.current.value;
			if (player.name !== name) {
				await renamePlayer(userId, player.name, name);
			}
			return;
		}
		case EternaltwinEventKind.UserDisabled:
		case EternaltwinEventKind.UserEnabled:
			// DinoRPG has no notion of a disabled account yet.
			LOGGER.log(`Eternaltwin event ${event.event} for user ${userId} ignored`);
			return;
	}
}
