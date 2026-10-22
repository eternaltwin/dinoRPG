import { EternaltwinNodeClient } from '@eternaltwin/client-node';
import type { UserStoreEvent } from '@eternaltwin/core/user/user-store-event';
import { UserStoreEventKind } from '@eternaltwin/core/user/user-store-event-kind';
import { timingSafeEqual } from 'node:crypto';
import { GLOBAL, LOGGER } from '../context.js';
import { getToken } from '../dao/eternaltwinTokenDao.js';
import { archiveOldUsername, getPlayerName, setPlayer, updateUsernameOnRelatedTables } from '../dao/playerDao.js';

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
 * Give a player their new Eternaltwin display name, everywhere it is copied.
 */
export async function renamePlayer(playerId: string, oldName: string, newName: string) {
	await setPlayer(playerId, { name: newName });
	await archiveOldUsername(playerId, oldName);
	await updateUsernameOnRelatedTables(playerId, newName);
}

/**
 * Apply a user event, read from the request body with `readUserStoreEvent` (`@eternaltwin/core`).
 *
 * The event only says which user changed, so the user is read back from Eternaltwin: this makes the
 * handler idempotent, and indifferent to events arriving twice or out of order. Events are not
 * retried when they fail, so the sync done at sign-in stays.
 */
export async function handleEternaltwinEvent(event: UserStoreEvent): Promise<void> {
	const userId = event.user.id;
	switch (event.event) {
		case UserStoreEventKind.UserUpdated: {
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
		case UserStoreEventKind.UserDisabled:
		case UserStoreEventKind.UserEnabled:
			// DinoRPG has no notion of a disabled account yet.
			LOGGER.log(`Eternaltwin event ${event.event.description} for user ${userId} ignored`);
			return;
	}
}
