import { Request, Response } from 'express';
import { auth, getRolePlayer } from '../../dao/playerDao.js';
import { AdminRole } from '@drpg/prisma';
import sendError from './sendErrors.js';

const checkRole = (role: AdminRole[]) => {
	return async (req: Request, res: Response, next: () => void) => {
		// Express 4 does not catch a rejected middleware: it would stop the server.
		try {
			const roles = await getRolePlayer(role);
			const authed = await auth(req);
			if (!roles.map(a => a.id).includes(authed.id)) {
				return res.status(500).send('Not admin !');
			}
		} catch (err) {
			return sendError(res, err);
		}
		next();
	};
};

export { checkRole };
