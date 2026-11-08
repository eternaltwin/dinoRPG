import { describe, it, expect, vi } from 'vitest';

vi.mock('../../utils/server/sendErrors.js', () => ({ default: vi.fn() }));

import lockMiddleware, { lockKey } from '../../middleware/lock.js';
import sendError from '../../utils/server/sendErrors.js';

const id = '7d2c1a3e-0b1f-4c35-9a3e-2b8e0f6a1c11';

describe('lockKey', () => {
	it('gives one key to every spelling of the same action', () => {
		const reference = lockKey('PUT', '/api/v1/dinoz/12/rest', id);
		expect(lockKey('PUT', '/API/v1/Dinoz/012/rest/', id)).toBe(reference);
		expect(lockKey('put', '/api/v1//dinoz/0012/rest', id.toUpperCase())).toBe(reference);
	});

	it('treats HEAD as the GET it runs', () => {
		expect(lockKey('HEAD', '/api/v1/offer/3', id)).toBe(lockKey('GET', '/api/v1/offer/3', id));
	});

	it('keeps distinct actions and players apart', () => {
		expect(lockKey('PUT', '/api/v1/dinoz/12/rest', id)).not.toBe(lockKey('PUT', '/api/v1/dinoz/13/rest', id));
		expect(lockKey('PUT', '/api/v1/dinoz/1/2', id)).not.toBe(lockKey('PUT', '/api/v1/dinoz/12', id));
		expect(lockKey('PUT', '/api/v1/dinoz/12/rest', id)).not.toBe(
			lockKey('PUT', '/api/v1/dinoz/12/rest', '00000000-0000-0000-0000-000000000000')
		);
	});
});

describe('lockMiddleware', () => {
	const call = (method: string, path: string, playerId: string) => {
		const next = vi.fn();
		const res = { on: vi.fn() };
		const authorization = `Basic ${Buffer.from(`${playerId}:token`).toString('base64')}`;
		lockMiddleware({ method, path, headers: { authorization } } as never, res as never, next);
		return next;
	};

	it('refuses a second spelling of an action still running', () => {
		expect(call('POST', '/api/v1/fight', id)).toHaveBeenCalled();
		expect(call('POST', '/API/v1/Fight/', id.toUpperCase())).not.toHaveBeenCalled();
		expect(sendError).toHaveBeenCalled();
	});
});
