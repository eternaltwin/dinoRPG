import { Request } from 'express';
import { archiveOldUsername, createPlayer, getPlayerId, setPlayer } from '../dao/playerDao.js';
import { forgeJWT } from '../utils/index.js';
import { RfcOauthClient } from '@eternaltwin/oauth-client-http/rfc-oauth-client';
import { OauthAccessToken } from '@eternaltwin/core/oauth/oauth-access-token';
import fetch from 'node-fetch';
import { addPlayerInRanking } from '../dao/rankingDao.js';
import gameConfig from '../config/game.config.js';
import { getSpecificSecret } from '../dao/secretDao.js';
import { createLog } from '../dao/logDao.js';
import { LogType } from '@drpg/prisma';
import urlJoin from 'url-join';
import { AdminRole } from '@drpg/prisma';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { GLOBAL } from '../context.js';

/**
 * @summary Forge a JWT with EternalTwin authentication
 * @param req
 * @param req.body.code {string}
 * @param res {string}
 * @return string
 */
export async function authenticateToET(req: Request) {
	let token: OauthAccessToken;
	let user: User;
	const config = GLOBAL.config;

	try {
		token = await getAuthorizationToken(req.body.code);
		user = await getUser(token.accessToken, config.eternaltwin.url);
	} catch (err) {
		console.error(err);
		throw new ExpectedError('An error occurred');
	}

	// Check if player already exists in database
	let player = await getPlayerId(user.user.id);

	// If player isn't found in database, create a new one
	if (player === null) {
		// Create new player in database
		player = await createPlayer({
			eternalTwinId: user.user.id,
			hasImported: false,
			name: user.user.display_name.current.value,
			money: gameConfig.general.initialMoney,
			quetzuBought: 0,
			leader: false,
			engineer: false,
			cooker: false,
			shopKeeper: false,
			merchant: false,
			priest: false,
			teacher: false,
			role: AdminRole.PLAYER
		});
		// Create player at position 0 in ranking
		await addPlayerInRanking(player.id);
		await createLog(LogType.PlayerCreated, player.id, undefined, player.name.toString(), player.id);
	}

	// Update display name if changed on ET side
	if (player && player.name !== user.user.display_name.current.value) {
		await setPlayer(player.id, { name: user.user.display_name.current.value });
		await archiveOldUsername(player.id, player.name);
	}

	const beta = await getSpecificSecret('beta');

	if (beta) {
		const admin = config.administrator;
		if (!(admin === user.user.id) && player.role === AdminRole.PLAYER) {
			throw new ExpectedError(
				`User ${user.user.id} (${user.user.display_name.current.value}), you are not allowed to enter the beta website.`
			);
		}
	}

	// Forge JWT with playerId
	return await forgeJWT(player.id);
}

async function getUser(accessToken: string, eternalTwinURI: string) {
	let res;

	try {
		res = await fetch(`${eternalTwinURI}api/v1/auth/self`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});
	} catch (err) {
		console.error(err);
		return Promise.reject(err);
	}

	return (await res.json()) as User;
}

async function getAuthorizationToken(code: string) {
	const oauthClient: RfcOauthClient = getRfcOauthClient();

	return oauthClient.getAccessToken(code);
}

/**
 * @summary Get the URI from the backend
 * @param _req
 * @return URL
 */
export async function getAuthorizationUri() {
	const oauthClient: RfcOauthClient = getRfcOauthClient();

	return oauthClient.getAuthorizationUri('base', 'authenticate');
}

function getRfcOauthClient() {
	const config = GLOBAL.config;

	return new RfcOauthClient({
		authorizationEndpoint: new URL(urlJoin(config.eternaltwin.url, 'oauth/authorize')),
		tokenEndpoint: new URL(urlJoin(config.eternaltwin.url, 'oauth/token')),
		callbackEndpoint: new URL(urlJoin(config.selfUrl.toString(), 'authentication')),
		clientId: config.eternaltwin.clientRef,
		clientSecret: config.eternaltwin.secret
	});
}

interface User {
	type: string;
	scope: string;
	client: {
		type: string;
		id: string;
		key: string;
		display_name: string;
	};
	user: {
		type: string;
		id: string;
		display_name: {
			current: {
				value: string;
			};
		};
	};
}
