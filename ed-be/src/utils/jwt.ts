import { Request, Response } from 'express';
import expressJwt from 'express-jwt';
import jsonwebtoken from 'jsonwebtoken';
import { getRolePlayer } from '../dao/playerDao.js';
import { Config } from '../config/config.js';
import { AdminRole } from '@drpg/prisma';
import { GLOBAL } from '../context.js';

const jwtConfig = () => {
	const config = GLOBAL.config;
	const secret: string = config.jwt.secretKey;
	return expressJwt.expressjwt({ secret, algorithms: ['HS256'] }).unless({
		path: [
			/\/api\/v1\/oauth*/,
			/\/api-docs*/,
			/\/api\/v1\/news\/\d+\/illustration/,
			/\/api\/v1\/clan\/\d+\/banner/,
			/\/api\/v1\/eternaltwin*/,
			/\/api\/ws*/
		]
	});
};

const forgeJWT = async (playerId: string): Promise<string> => {
	const config = GLOBAL.config;
	const exp: number = Math.round(Date.now() / 1000) + config.jwt.expiration;
	const isAdmin: boolean = await isPlayerAdmin(playerId, config);
	return jsonwebtoken.sign(
		{
			playerId: '715b7ff3-8147-4522-ac40-91239a337177', //playerId,
			exp: exp,
			isAdmin: isAdmin
		},
		config.jwt.secretKey
	);
};

const checkIsAdmin = (req: Request, res: Response, next: () => void) => {
	if (!req.auth?.playerId) {
		return res.status(500).send('No auth data !');
	}
	if (!req.auth.isAdmin) {
		return res.status(500).send(`Player ${req.auth.playerId} is not admin !`);
	}
	next();
};

async function isPlayerAdmin(playerId: string, config: Config): Promise<boolean> {
	const admin = config.administrator;
	if (admin === playerId) return true;
	const administrators = await getRolePlayer(AdminRole.ADMIN);
	return administrators.some(p => p.id === playerId);
}

export { checkIsAdmin, forgeJWT, jwtConfig };
