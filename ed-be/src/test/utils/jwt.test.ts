import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Response } from 'express';
import { AdminRole } from '@drpg/prisma';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn(), getRolePlayer: vi.fn() }));
vi.mock('../../context.js', () => ({ DISCORD: { sendError: vi.fn() } }));

import { auth, getRolePlayer } from '../../dao/playerDao.js';
import { checkRole } from '../../utils/server/jwt.js';

function makeResponse() {
	const res = { headersSent: false, status: vi.fn(), send: vi.fn() };
	res.status.mockReturnValue(res);
	res.send.mockReturnValue(res);
	return res;
}

const run = async () => {
	const res = makeResponse();
	const next = vi.fn();
	await checkRole([AdminRole.ADMIN])(makeRequest(), res as unknown as Response, next);
	return { res, next };
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(getRolePlayer).mockResolvedValue([{ id: 'admin' }] as never);
	vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('checkRole', () => {
	it('answers an anonymous caller instead of rejecting, which would stop the server', async () => {
		vi.mocked(auth).mockRejectedValue(new ExpectedError('You are not logged in'));
		const { res, next } = await run();
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith('You are not logged in');
		expect(next).not.toHaveBeenCalled();
	});
	it('answers instead of rejecting when the role lookup fails', async () => {
		vi.mocked(getRolePlayer).mockRejectedValue(new Error('database down'));
		const { res, next } = await run();
		expect(res.status).toHaveBeenCalledWith(500);
		expect(next).not.toHaveBeenCalled();
	});
	it('refuses a logged-in player without the role', async () => {
		vi.mocked(auth).mockResolvedValue({ id: 'player' } as never);
		const { res, next } = await run();
		expect(res.send).toHaveBeenCalledWith('Not admin !');
		expect(next).not.toHaveBeenCalled();
	});
	it('lets a player with the role through', async () => {
		vi.mocked(auth).mockResolvedValue({ id: 'admin' } as never);
		const { res, next } = await run();
		expect(next).toHaveBeenCalledTimes(1);
		expect(res.send).not.toHaveBeenCalled();
	});
});
