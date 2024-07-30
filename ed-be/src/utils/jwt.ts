import { Request, Response } from 'express';
import expressJwt from 'express-jwt';
import jsonwebtoken from 'jsonwebtoken';
import { getEternalTwinId, getRolePlayer } from '../dao/playerDao.js';
import { Config, loadConfig } from '../config/config.js';
import { AdminRole } from '@drpg/prisma';

const jwtConfig = () => {
	const config = loadConfig() as Config;
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

const forgeJWT = async (playerId: number): Promise<string> => {
	const config: Config = loadConfig();
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

const checkIsAdmin = (req: Request, res: Response, next: () => void) => {
	if (!req.auth?.playerId) {
		return res.status(500).send('No auth data !');
	}
	if (!req.auth.isAdmin) {
		return res.status(500).send(`Player ${req.auth.playerId} is not admin !`);
	}
	next();
};

async function isPlayerAdmin(playerId: number, config: Config): Promise<boolean> {
	const ETId = await getEternalTwinId(playerId);
	if (!ETId) return false;
	const admin = config.administrator;
	if (admin === ETId.eternalTwinId) return true;
	const administrators = await getRolePlayer(AdminRole.ADMIN);
	if (administrators.some(p => p.eternalTwinId === ETId.eternalTwinId)) return true;
	return false;
}

export { checkIsAdmin, forgeJWT, jwtConfig };
