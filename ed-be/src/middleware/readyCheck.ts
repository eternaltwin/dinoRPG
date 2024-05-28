import type { NextFunction, Request, Response } from 'express';
import ServerState from '../utils/ServerState.js';

export const readyCheck = (req: Request, res: Response, next: NextFunction) => {
	const isReady = ServerState.isReady();

	if (req.path !== '/api/is-ready' && !isReady) {
		res.status(999).send('Server is not ready');
		return;
	}

	next();
};
