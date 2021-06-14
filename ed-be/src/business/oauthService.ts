import { Request, Response } from 'express';
import { getPlayerId, createPlayer } from '../dao/playerDao.js';
import { getConfig } from '../utils/context.js';
import { forgeJWT } from '../utils/jwt.js';
import _ from 'lodash';
import { Player, Config } from '../models/index.js';
import { RfcOauthClient } from '@eternal-twin/oauth-client-http/lib/rfc-oauth-client.js';
import fetch from 'node-fetch';

const authenticateToET = async (
	req: Request,
	res: Response
): Promise<Response> => {
	let token: AccessToken;
	let user: User;
	const config: Config = getConfig();

	try {
		token = await getAuthorizationToken(req.body.code, config);
		user = await getUser(token.access_token, config.general.eternalTwinURI);
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
			name: user.user.display_name.current.value,
			money: config.player.initialMoney,
			quetzuBought: 0,
			leader: false,
			engineer: false,
			cooker: false,
			shopKeeper: false,
			merchant: false,
			priest: false,
			teacher: false,
		});

		// Create new player in database
		player = await createPlayer(player.get());
	}

	// Forge JWT with playerId
	const JWT = await forgeJWT(player!.get().playerId);

	return res.status(200).send(JWT);
};

async function getUser(accessToken: string, eternalTwinURI: string) {
	let res;

	try {
		res = await fetch(`${eternalTwinURI}api/v1/auth/self`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		})
	} catch (err) {
		console.error(err);
		return Promise.reject(err);
	}

	return await res.json();
}

async function getAuthorizationToken(
	code: string,
	config: Config
): Promise<AccessToken> {
	const body = { 
		code: code,
		grant_type: 'authorization_code'
	};
	const keyPassword: string = Buffer.from(`${config.oauth.client_id}:${config.oauth.client_secret}`).toString('base64');
	let res;

	try {
		res = await fetch(`${config.general.eternalTwinURI}oauth/token`, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-type': 'application/json',
				'Authorization': `Basic ${keyPassword}`
			}
		});
	} catch (err) {
		console.error(err);
		return Promise.reject(err);
	}

	return await res.json();
}

const getAuthorizationUri = (req: Request, res: Response): Response => {
	const config: Config = getConfig();

	const oauthClient: RfcOauthClient = new RfcOauthClient({
		authorizationEndpoint: new URL(`${config.general.eternalTwinURI}${config.oauth.authorizationURI}`),
		tokenEndpoint: new URL(`${config.general.eternalTwinURI}${config.oauth.tokenURI}`),
		callbackEndpoint: new URL(`${config.general.frontUri}${config.oauth.callbackURI}`),
		clientId: config.oauth.client_id,
		clientSecret: config.oauth.client_secret,
	});

	return res.status(200).send(oauthClient.getAuthorizationUri('base', 'authenticate'));
}

interface AccessToken {
	access_token: string;
	expires_in: number,
	token_type: string
}

interface User {
	type: string,
	scope: string,
	client: {
	  type: string,
	  id: string,
	  key: string,
	  display_name: string
	},
	user: {
	  type: string,
	  id: string,
	  display_name: {
		current: {
		  value: string
		}
	  }
	}
  }

export { authenticateToET, getAuthorizationUri };
