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

/**
 * Key of the anti-burst lock. Built from what identifies the action, not from how the request spells it:
 * Express routes ignore the case of the path and accept `01` for `1` in numeric parameters, Postgres compares
 * UUIDs without case and HEAD runs the GET handler. Without this, each spelling got its own lock.
 * This lock only blunts bursts; concurrent requests are settled by the conditional writes of each action.
 */
export function lockKey(method: string, path: string, playerId: string) {
	const normalizedMethod = method.toUpperCase() === 'HEAD' ? 'GET' : method.toUpperCase();
	const normalizedPath = path
		.toLowerCase()
		.split('/')
		.filter(segment => segment.length > 0)
		.map(segment => (/^\d+$/.test(segment) ? String(Number(segment)) : segment))
		.join('/');
	return `${normalizedMethod}:${normalizedPath}:${playerId.trim().toLowerCase()}`;
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

		const key = lockKey(method, path, id);

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
