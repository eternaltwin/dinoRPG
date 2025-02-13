import { Request, Response } from 'express';
import { auth, getRolePlayer } from '../dao/playerDao.js';
import { AdminRole } from '@drpg/prisma';

const checkIsAdmin = async (req: Request, res: Response, next: () => void) => {
	const admins = await getRolePlayer(AdminRole.ADMIN)
	const authed = await auth(req)
	if (!admins.map(a => a.id).includes(authed.id)) {
		return res.status(500).send('Not admin !');
	}
	next();
};


export { checkIsAdmin };
