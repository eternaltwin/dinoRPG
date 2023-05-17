import { Request, Response } from 'express';
import expressJwt from 'express-jwt';
import jsonwebtoken from 'jsonwebtoken';
import { getConfig } from './context.js';
import { Config } from '@drpg/core/models/config/Config';
import { getEternalTwinId } from '../dao/playerDao.js';
import { Player } from '../entity/index.js';

const jwtConfig = () => {
	const config = getConfig() as Config;
	const secret: string = config.jwt.secretKey;
	return expressJwt({ secret, algorithms: ['HS256'] }).unless({
		path: [/\/api\/v1\/oauth*/, /\/api-docs*/]
	});
};

const forgeJWT = async (playerId: number): Promise<string> => {
	const config: Config = getConfig();
	const exp: number = Math.round(Date.now() / 1000) + config.jwt.expiration;
	const isAdmin: boolean = await isPlayerAdmin(playerId, config);
	return jsonwebtoken.sign(
		{
			playerId: playerId,
			exp: exp,
			isAdmin: isAdmin
		},
		config.jwt.secretKey
	);
};

const checkIsAdmin = (req: Request, res: Response, next: Function) => {
	if (!req.user!.isAdmin) {
		return res.status(500).send(`Player ${req.user!.playerId} is not admin !`);
	}
	next();
};

async function isPlayerAdmin(playerId: number, config: Config): Promise<boolean> {
	const ETId: Player | null = await getEternalTwinId(playerId);
	const admins: Array<string | undefined> = Object.values(config.admin);
	return admins.includes(ETId?.eternalTwinId);
}

export { jwtConfig, forgeJWT, checkIsAdmin };
