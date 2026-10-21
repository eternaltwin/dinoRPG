import { describe, it, expect, vi, beforeEach } from 'vitest';

const etwinClientInstance = { getUserById: vi.fn() };

vi.mock('@eternaltwin/client-node', () => ({
	EternaltwinNodeClient: vi.fn(function () {
		return etwinClientInstance;
	})
}));
vi.mock('../../context.js', () => ({
	GLOBAL: { config: { eternaltwin: { url: 'http://api/', serverChannel: 'dev', secret: 'sec' } } },
	LOGGER: { error: vi.fn(), log: vi.fn() }
}));
vi.mock('../../dao/eternaltwinTokenDao.js', () => ({ getToken: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({
	archiveOldUsername: vi.fn(),
	getPlayerName: vi.fn(),
	setPlayer: vi.fn(),
	updateUsernameOnRelatedTables: vi.fn()
}));

import { getToken } from '../../dao/eternaltwinTokenDao.js';
import { archiveOldUsername, getPlayerName, setPlayer, updateUsernameOnRelatedTables } from '../../dao/playerDao.js';
import {
	EternaltwinEvent,
	EternaltwinEventKind,
	handleEternaltwinEvent,
	isEternaltwinAuthorization,
	readEternaltwinEvent
} from '../../business/eternaltwinEventService.js';

const USER_ID = '8a1c5f0e-2d6b-4b7a-a1f3-6c2e9d0b4e57';
const EVENT_ID = '0f6a2c39-8f3e-4d43-9b8e-1b0b6c4f7a21';

function body(extra: Record<string, unknown> = {}) {
	return {
		event: 'UserUpdated',
		id: EVENT_ID,
		time: '2026-10-19T14:03:12.481Z',
		user: { type: 'User', id: USER_ID },
		...extra
	};
}

function basic(login: string, password: string) {
	return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe('isEternaltwinAuthorization', () => {
	it('accepts eternaltwin.<server channel> with the client secret', () => {
		expect(isEternaltwinAuthorization(basic('eternaltwin.dev', 'sec'))).toBe(true);
	});

	it('rejects a wrong secret, a wrong channel or no header', () => {
		expect(isEternaltwinAuthorization(basic('eternaltwin.dev', 'nope'))).toBe(false);
		expect(isEternaltwinAuthorization(basic('eternaltwin.production', 'sec'))).toBe(false);
		expect(isEternaltwinAuthorization(undefined)).toBe(false);
	});
});

describe('readEternaltwinEvent', () => {
	it('reads a valid event', () => {
		expect(readEternaltwinEvent(body())).toEqual({
			event: EternaltwinEventKind.UserUpdated,
			id: EVENT_ID,
			time: new Date('2026-10-19T14:03:12.481Z'),
			user: { type: 'User', id: USER_ID }
		});
	});

	it('returns null for an unknown kind or an invalid body', () => {
		expect(readEternaltwinEvent(body({ event: 'UserDeleted' }))).toBeNull();
		expect(readEternaltwinEvent(body({ id: 'not-a-uuid' }))).toBeNull();
		expect(readEternaltwinEvent(body({ time: 'yesterday' }))).toBeNull();
		expect(readEternaltwinEvent(body({ user: { type: 'User', id: 'x' } }))).toBeNull();
		expect(readEternaltwinEvent(null)).toBeNull();
		expect(readEternaltwinEvent({})).toBeNull();
	});
});

describe('handleEternaltwinEvent', () => {
	const event = readEternaltwinEvent(body()) as EternaltwinEvent;

	it('renames the player with the name read back from Eternaltwin', async () => {
		vi.mocked(getPlayerName).mockResolvedValue({ id: USER_ID, name: 'old' });
		vi.mocked(getToken).mockResolvedValue({ accessToken: 'tok' } as never);
		etwinClientInstance.getUserById.mockResolvedValue({ displayName: { current: { value: 'new' } } });

		await handleEternaltwinEvent(event);

		expect(etwinClientInstance.getUserById).toHaveBeenCalledWith({ userId: USER_ID, auth: 'tok' });
		expect(setPlayer).toHaveBeenCalledWith(USER_ID, { name: 'new' });
		expect(archiveOldUsername).toHaveBeenCalledWith(USER_ID, 'old');
		expect(updateUsernameOnRelatedTables).toHaveBeenCalledWith(USER_ID, 'new');
	});

	it('does nothing when the name did not change', async () => {
		vi.mocked(getPlayerName).mockResolvedValue({ id: USER_ID, name: 'same' });
		vi.mocked(getToken).mockResolvedValue({ accessToken: 'tok' } as never);
		etwinClientInstance.getUserById.mockResolvedValue({ displayName: { current: { value: 'same' } } });

		await handleEternaltwinEvent(event);

		expect(setPlayer).not.toHaveBeenCalled();
	});

	it('skips unknown players and players without a token', async () => {
		vi.mocked(getPlayerName).mockResolvedValue(null);
		vi.mocked(getToken).mockResolvedValue(null);

		await handleEternaltwinEvent(event);

		expect(etwinClientInstance.getUserById).not.toHaveBeenCalled();
		expect(setPlayer).not.toHaveBeenCalled();
	});
});
