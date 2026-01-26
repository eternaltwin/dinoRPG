import { Request, Response } from 'express';
import { auth, getRolePlayer } from '../dao/playerDao.js';
import { AdminRole } from '@drpg/prisma';

const checkRole = (role: AdminRole[]) => {
	return async (req: Request, res: Response, next: () => void) => {
		const roles = await getRolePlayer(role);
		const authed = await auth(req);
		if (!roles.map(a => a.id).includes(authed.id)) {
			return res.status(500).send('Not admin !');
		}
		next();
	};
};

export { checkRole };
