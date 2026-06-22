import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServerEventType } from '@drpg/core/models/serverEvents/ServerEventType';
import { WsChannel } from '@drpg/core/models/serverEvents/WsChannel';

vi.mock('../../context.js', () => ({
	GLOBAL: { liveStats: { addConnectedPlayers: vi.fn(), removeConnectedPlayers: vi.fn() } },
	LOGGER: { warn: vi.fn(), log: vi.fn(), error: vi.fn(), info: vi.fn() }
}));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn(), getClanIdAndNameFromPlayerId: vi.fn() }));
vi.mock('../../dao/clansDao.js', () => ({ createClanMessageRequest: vi.fn(), deleteClanMessageRequest: vi.fn() }));
vi.mock('../../business/clanService.js', () => ({ checkMessageCanBeDeleted: vi.fn() }));
vi.mock('../../utils/helpers/ValidatorHelper.js', () => ({ isJson: vi.fn() }));

import { auth, getClanIdAndNameFromPlayerId } from '../../dao/playerDao.js';
import {
	authenticate,
	setWsConnectionToAlive,
	checkIfWsClientsAreAlive,
	disconnectSseUser,
	sendSseMessageToUserInChannel
} from '../../business/serverEventService.js';

function reqFor(channel: string) {
	return {
		body: { channel },
		socket: { remoteAddress: '1.2.3.4' },
		headers: { 'user-agent': 'jest' }
	} as never;
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
});

describe('authenticate', () => {
	it('issues a ticket for a websocket connection', async () => {
		const result = await authenticate(reqFor(WsChannel.GLOBAL_CHAT ?? 'global'), ServerEventType.WEBSOCKET);
		expect(result.ticket).toBeDefined();
	});
	it('issues a ticket for an SSE connection', async () => {
		const result = await authenticate(reqFor('sse-channel'), ServerEventType.SSE);
		expect(result.ticket).toBeDefined();
	});
	it('throws when there is no user-agent header', async () => {
		const req = { body: { channel: 'x' }, socket: { remoteAddress: '1.2.3.4' }, headers: {} } as never;
		await expect(authenticate(req, ServerEventType.SSE)).rejects.toThrow('user-agent');
	});
	it('throws when accessing the clan forum without a clan', async () => {
		vi.mocked(getClanIdAndNameFromPlayerId).mockResolvedValue({ ClanMember: null } as never);
		await expect(authenticate(reqFor(WsChannel.CLAN_FORUM), ServerEventType.WEBSOCKET)).rejects.toThrow('not in a clan');
	});
});

describe('websocket keepalive', () => {
	it('setWsConnectionToAlive marks the connection alive', () => {
		const ws = { isAlive: false } as never;
		setWsConnectionToAlive(ws);
		expect((ws as { isAlive: boolean }).isAlive).toBe(true);
	});
	it('checkIfWsClientsAreAlive pings live clients and flags them for the next round', () => {
		const ping = vi.fn();
		const ws = { isAlive: true, ping };
		const wss = { clients: new Set([ws]) } as never;
		checkIfWsClientsAreAlive(wss);
		expect(ping).toHaveBeenCalled();
		expect(ws.isAlive).toBe(false);
	});
});

describe('SSE helpers', () => {
	it('disconnectSseUser warns for an unknown ticket', async () => {
		const req = { url: '/sse?ticket=unknown-uuid' } as never;
		await expect(disconnectSseUser(req)).resolves.toBeUndefined();
	});
	it('sendSseMessageToUserInChannel is a no-op when the channel is empty', async () => {
		await expect(sendSseMessageToUserInChannel('p1', 'empty-channel' as never, { a: 1 })).resolves.toBeUndefined();
	});
});
