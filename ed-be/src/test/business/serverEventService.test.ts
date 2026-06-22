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
vi.mock('../../utils/helpers/ValidatorHelper.js', () => ({ isJson: vi.fn().mockReturnValue(true) }));

import { WebSocket } from 'ws';
import { WsMessageAction } from '@drpg/core/models/serverEvents/WsMessageAction';
import { SseChannel } from '@drpg/core/models/serverEvents/SseChannel';
import { auth, getClanIdAndNameFromPlayerId } from '../../dao/playerDao.js';
import { createClanMessageRequest } from '../../dao/clansDao.js';
import { checkMessageCanBeDeleted } from '../../business/clanService.js';
import {
	authenticate,
	connectUserToWsChannel,
	connectUserToSseChannel,
	processWsIncomingMessage,
	disconnectWsUser,
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

describe('websocket channel flow', () => {
	it('connects a user, processes create/delete messages and disconnects', async () => {
		const ua = 'jest';
		const ip = '9.9.9.9';
		vi.mocked(getClanIdAndNameFromPlayerId).mockResolvedValue({ ClanMember: { clan: { id: 1 } } } as never);
		vi.mocked(createClanMessageRequest).mockResolvedValue({ id: 7, content: 'hi' } as never);

		const ticketDto = await authenticate(
			{ body: { channel: WsChannel.CLAN_FORUM }, socket: { remoteAddress: ip }, headers: { 'user-agent': ua } } as never,
			ServerEventType.WEBSOCKET
		);

		const ws = { id: '', isAlive: false } as never;
		await connectUserToWsChannel(ws, {
			url: `/ws?ticket=${ticketDto.ticket}`,
			socket: { remoteAddress: ip },
			headers: { 'user-agent': ua }
		} as never);
		expect((ws as { id: string }).id).toBeTruthy();

		const client = { id: (ws as { id: string }).id, readyState: WebSocket.OPEN, send: vi.fn() };
		const wss = { clients: new Set([client]) } as never;

		await processWsIncomingMessage(
			wss,
			(ws as { id: string }).id,
			Buffer.from(JSON.stringify({ action: WsMessageAction.CREATE, message: 'hello' }))
		);
		expect(createClanMessageRequest).toHaveBeenCalled();
		expect(client.send).toHaveBeenCalled();

		await processWsIncomingMessage(
			wss,
			(ws as { id: string }).id,
			Buffer.from(JSON.stringify({ action: WsMessageAction.DELETE, msgId: 7 }))
		);
		expect(checkMessageCanBeDeleted).toHaveBeenCalled();

		disconnectWsUser(ws);
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

	it('connects an SSE user, sends a message and disconnects', async () => {
		const ua = 'jest';
		const ip = '7.7.7.7';
		vi.mocked(auth).mockResolvedValue({ id: 'sse-player' } as never);
		const ticketDto = await authenticate(
			{ body: { channel: SseChannel.NOTIFICATION }, socket: { remoteAddress: ip }, headers: { 'user-agent': ua } } as never,
			ServerEventType.SSE
		);
		const res = { write: vi.fn() } as never;
		await connectUserToSseChannel(
			{ url: `/sse?ticket=${ticketDto.ticket}`, socket: { remoteAddress: ip }, headers: { 'user-agent': ua } } as never,
			res
		);
		await sendSseMessageToUserInChannel('sse-player', SseChannel.NOTIFICATION, { hello: true });
		expect((res as { write: ReturnType<typeof vi.fn> }).write).toHaveBeenCalled();
		await disconnectSseUser({ url: `/sse?ticket=${ticketDto.ticket}` } as never);
	});
});
