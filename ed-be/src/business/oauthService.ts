import { Request } from 'express';
import { createPlayer, getPlayerId } from '../dao/playerDao.js';
import { getConfig } from '../utils/context.js';
import { forgeJWT } from '../utils/jwt.js';
import { Config } from '../models/index.js';
import { Player } from '../entity/index.js';
import { RfcOauthClient } from '@eternal-twin/oauth-client-http/rfc-oauth-client';
import { OauthAccessToken } from '@eternal-twin/core/oauth/oauth-access-token';
import fetch from 'node-fetch';
import { addPlayerInRanking } from '../dao/rankingDao.js';
import gameConfig from '../config/game.config.js';
import { ErrorFormator } from '../utils/errorFormator.js';

/**
 * @summary Forge a JWT with EternalTwin authentication
 * @param req
 * @param req.body.code {string}
 * @param res {string}
 * @return string
 */
const authenticateToET = async (req: Request): Promise<string> => {
	let token: OauthAccessToken;
	let user: User;
	const config: Config = getConfig();

	try {
		token = await getAuthorizationToken(req.body.code);
		user = await getUser(token.accessToken, config.general.eternalTwinServerUri);
	} catch (err) {
		console.error(err);
		throw new ErrorFormator(500, 'An error occurred');
	}

	// Check if player already exists in database
	let player: Player | null = await getPlayerId(user.user.id);

	// If player isn't found in database, create a new one
	if (player === null) {
		player = {
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
			teacher: false
		} as Player;

		// Create new player in database
		player = await createPlayer(player);
		// Create player at position 0 in ranking
		await addPlayerInRanking(player!.id);
	}

	// Forge JWT with playerId
	return await forgeJWT(player!.id);
};

async function getUser(accessToken: string, eternalTwinURI: string) {
	let res;

	try {
		//@ts-ignore
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

	return await res.json();
}

async function getAuthorizationToken(code: string): Promise<OauthAccessToken> {
	const oauthClient: RfcOauthClient = getRfcOauthClient(true);

	return oauthClient.getAccessToken(code);
}

/**
 * @summary Get the URI from the backend
 * @param _req
 * @return URL
 */
const getAuthorizationUri = (): URL => {
	const oauthClient: RfcOauthClient = getRfcOauthClient(false);

	return oauthClient.getAuthorizationUri('base', 'authenticate');
};

function getRfcOauthClient(useDockerUri: boolean): RfcOauthClient {
	const config: Config = getConfig();
	const eternalTwinURI: string = useDockerUri
		? config.general.eternalTwinServerUri
		: config.general.eternalTwinPublicUri;

	return new RfcOauthClient({
		authorizationEndpoint: new URL(`${eternalTwinURI}${config.oauth.authorizationUri}`),
		tokenEndpoint: new URL(`${eternalTwinURI}${config.oauth.tokenUri}`),
		callbackEndpoint: new URL(`${config.general.frontUri}${config.oauth.callbackUri}`),
		clientId: config.oauth.clientId,
		clientSecret: config.oauth.clientSecret
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

export { authenticateToET, getAuthorizationUri };
