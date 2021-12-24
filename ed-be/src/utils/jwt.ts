import expressJwt from 'express-jwt';
import jsonwebtoken from 'jsonwebtoken';
import { getConfig } from './context.js';
import { Config } from '../models/index.js';

const jwtConfig = () => {
	const config = getConfig() as Config;
	const secret: string = config.jwt.secretKey;
	return expressJwt({ secret, algorithms: ['HS256'] }).unless({
		path: ['/api/oauth/authenticate/eternal-twin', '/api/oauth/redirect']
	});
};

const forgeJWT = (playerId: number): string => {
	const config = getConfig() as Config;
	const exp = Math.round(Date.now() / 1000) + config.jwt.expiration;
	return jsonwebtoken.sign(
		{ playerId: playerId, exp: exp },
		config.jwt.secretKey
	);
};

export { jwtConfig, forgeJWT };
