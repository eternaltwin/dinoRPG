import { Request, Response } from 'express';
import { getPlayerId, createPlayer } from '../dao/playerDao';
import { getConfig } from '../utils/context';
import { forgeJWT } from '../utils/jwt';
import { isNil } from 'lodash';
import request from 'request';
import { Player, Config } from '../models';
import { RfcOauthClient } from '@eternal-twin/oauth-client-http/lib/rfc-oauth-client.js';

const authenticateToET = async (
	req: Request,
	res: Response
): Promise<Response> => {
	let eternalTwinPlayer: request.Response;

	// Send authentication to EternalTwin server.
	try {
		eternalTwinPlayer = await doAuthenticationRequestToET(req.body);
	} catch (error) {
		return res.status(500).send({
			message: error || 'Incorrect login or password.',
		});
	}

	// Check if player already exists in database
	let player: Player | null = await getPlayerId(eternalTwinPlayer.body.id);

	const config: Config = getConfig();

	// If player isn't found in database, create a new one
	if (isNil(player)) {
		player = Player.build({
			eternalTwinId: eternalTwinPlayer.body.id,
			name: eternalTwinPlayer.body.display_name.current.value,
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

function doAuthenticationRequestToET(
	params: Authentication
): Promise<request.Response> {
	return new Promise((resolve, reject) => {
		request(
			{
				url: 'http://localhost:50320/api/v1/auth/self?method=Etwin',
				method: 'PUT',
				json: params,
			},
			(err, response, html) => {
				if (response.body === 'Internal Server Error') {
					reject(response);
				} else {
					resolve(response);
				}
			}
		);
	});
}

const getAccessToken = () => {
	const configuration = getConfig();

	const oauthClient = new RfcOauthClient({
		authorizationEndpoint: new URL(configuration.oauth.authorizationURI),
		tokenEndpoint: new URL(configuration.oauth.tokenURI),
		callbackEndpoint: new URL(configuration.oauth.callbackURI),
		clientId: configuration.oauth.client_id,
		clientSecret: configuration.oauth.client_secret,
	});
};

interface Authentication {
	login: string;
	password: string;
}

export { authenticateToET, getAccessToken };
