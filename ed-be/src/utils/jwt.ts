import expressJwt from 'express-jwt';
import jsonwebtoken from 'jsonwebtoken';
import { getConfig } from './context';
import { Config } from '../models';

const jwtConfig = () => {
	const config = getConfig() as Config;
	const secret: string = config.jwt.secretKey;
	return expressJwt({ secret, algorithms: ['HS256'] }).unless({
		path: ['/api/oauth/authenticate/eternal-twin'],
	});
};

const forgeJWT = (playerId: number): string => {
	const config = getConfig() as Config;
	return jsonwebtoken.sign({ playerId: playerId }, config.jwt.secretKey);
};

export { jwtConfig, forgeJWT };
