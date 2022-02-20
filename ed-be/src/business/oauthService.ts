import { Request, Response } from 'express';
import { getPlayerId, createPlayer } from '../dao/playerDao.js';
import { getConfig } from '../utils/context.js';
import { forgeJWT } from '../utils/jwt.js';
import _ from 'lodash';
import { Player, Config } from '../models/index.js';
import { RfcOauthClient } from '@eternal-twin/oauth-client-http/lib/rfc-oauth-client.js';
import { OauthAccessToken } from '@eternal-twin/core/lib/oauth/oauth-access-token.js';
import fetch from 'node-fetch';
import { addPlayerInRanking } from '../dao/rankingDao.js';

const authenticateToET = async (
	req: Request,
	res: Response
): Promise<Response> => {
	let token: OauthAccessToken;
	let user: User;
	const config: Config = getConfig();

	try {
		token = await getAuthorizationToken(req.body.code);
		user = await getUser(
			token.accessToken,
			config.general.eternalTwinServerUri
		);
	} catch (err) {
		console.error(err);
		return res.status(500).send('An error occurred');
	}

	// Check if player already exists in database
	let player: Player | null = await getPlayerId(user.user.id);

	// If player isn't found in database, create a new one
	if (_.isNil(player)) {
		player = Player.build({
			eternalTwinId: user.user.id,
			hasImported: false,
			name: user.user.display_name.current.value,
			money: config.player.initialMoney,
			quetzuBought: 0,
			leader: false,
			engineer: false,
			cooker: false,
			shopKeeper: false,
			merchant: false,
			priest: false,
			teacher: false
		});

		// Create new player in database
		player = await createPlayer(player.get());
		// Create player at position 0 in ranking
		await addPlayerInRanking(player!.get().playerId);
	}

	// Forge JWT with playerId
	const JWT = await forgeJWT(player!.get().playerId);

	return res.status(200).send(JWT);
};

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

	return await res.json();
}

async function getAuthorizationToken(code: string): Promise<OauthAccessToken> {
	const oauthClient: RfcOauthClient = getRfcOauthClient(true);

	return oauthClient.getAccessToken(code);
}

const getAuthorizationUri = (req: Request, res: Response): Response => {
	const oauthClient: RfcOauthClient = getRfcOauthClient(false);

	return res
		.status(200)
		.send(oauthClient.getAuthorizationUri('base', 'authenticate'));
};

function getRfcOauthClient(useDockerUri: boolean): RfcOauthClient {
	const config: Config = getConfig();
	const eternalTwinURI: string = useDockerUri
		? config.general.eternalTwinServerUri
		: config.general.eternalTwinPublicUri;

	return new RfcOauthClient({
		authorizationEndpoint: new URL(
			`${eternalTwinURI}${config.oauth.authorizationUri}`
		),
		tokenEndpoint: new URL(`${eternalTwinURI}${config.oauth.tokenUri}`),
		callbackEndpoint: new URL(
			`${config.general.frontUri}${config.oauth.callbackUri}`
		),
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
