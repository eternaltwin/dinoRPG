import { describe, it, expect, vi, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { createState, verifyState } from '../../utils/server/oauthState.js';

const SECRET = 'test-secret';

afterEach(() => vi.useRealTimers());

describe('oauthState', () => {
	it('accepts the rfp it handed out', () => {
		const { state, rfp } = createState(SECRET);
		expect(() => verifyState(state, rfp, SECRET)).not.toThrow();
	});

	it('never puts the clear rfp in the state', () => {
		const { state, rfp } = createState(SECRET);
		// The state travels through Eternaltwin; only the hash may ride along.
		expect(state).not.toContain(rfp);
		const payload = jwt.decode(state) as { rfp_hash: string };
		expect(payload.rfp_hash).not.toBe(rfp);
	});

	it('gives out a different rfp every time', () => {
		expect(createState(SECRET).rfp).not.toBe(createState(SECRET).rfp);
	});

	it('rejects an rfp that does not match the state', () => {
		const { state } = createState(SECRET);
		expect(() => verifyState(state, createState(SECRET).rfp, SECRET)).toThrow('Invalid or expired OAuth state');
	});

	it('rejects a state signed with another secret', () => {
		const { rfp } = createState(SECRET);
		const forged = jwt.sign({ rfp_hash: 'whatever' }, 'other-secret');
		expect(() => verifyState(forged, rfp, SECRET)).toThrow('Invalid or expired OAuth state');
	});

	it('rejects an expired state', () => {
		vi.useFakeTimers();
		const { state, rfp } = createState(SECRET);
		// Codes live 10 minutes; a state outliving them is worthless.
		vi.advanceTimersByTime(11 * 60 * 1000);
		expect(() => verifyState(state, rfp, SECRET)).toThrow('Invalid or expired OAuth state');
	});

	it('rejects a missing state or rfp', () => {
		const { state, rfp } = createState(SECRET);
		expect(() => verifyState(undefined, rfp, SECRET)).toThrow('Missing OAuth state');
		expect(() => verifyState(state, undefined, SECRET)).toThrow('Missing OAuth request forgery protection');
	});
});
