import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import type { Request, Response, NextFunction } from 'express';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/server/sendErrors.js';

const locks = new Map<string, NodeJS.Timeout>();

function deleteLock(key: string) {
	if (locks.has(key)) {
		clearTimeout(locks.get(key));
		locks.delete(key);
	}
}

export default function lockMiddleware(req: Request, res: Response, next: NextFunction) {
	const { method, path } = req;

	// Eternaltwin signs every event with the same Basic login and may post several at once. Locking
	// on it would reject the concurrent ones, and Eternaltwin never sends a failed event again.
	if (path === apiRoutes.eternalTwinEventsRoute) {
		return next();
	}

	const {
		headers: { authorization }
	} = req;

	if (authorization) {
		const [id] = Buffer.from(authorization.split(' ')[1] || '', 'base64')
			.toString()
			.split(':');

		if (!id || id === 'null') {
			return sendError(res, new ExpectedError('Invalid authorization header content'));
		}

		const key = `${method}:${path.toLowerCase().replace(/\//g, '')}:${id}`;

		if (locks.has(key)) {
			return sendError(res, new ExpectedError('Too many requests'));
		}

		locks.set(
			key,
			setTimeout(() => {
				deleteLock(key);
			}, 10000)
		);

		res.on('close', () => {
			deleteLock(key);
		});

		res.on('error', () => {
			deleteLock(key);
		});

		res.on('finish', () => {
			deleteLock(key);
		});
	}

	return next();
}
