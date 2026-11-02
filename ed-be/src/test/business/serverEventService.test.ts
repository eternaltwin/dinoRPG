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
vi.mock('../../business/clanChampionshipMatchService.js', () => ({ findReadableMatchOfClan: vi.fn() }));
vi.mock('../../utils/helpers/ValidatorHelper.js', () => ({ isJson: vi.fn().mockReturnValue(true) }));

import { WebSocket } from 'ws';
import { WsMessageAction } from '@drpg/core/models/serverEvents/WsMessageAction';
import { SseChannel } from '@drpg/core/models/serverEvents/SseChannel';
import { auth, getClanIdAndNameFromPlayerId } from '../../dao/playerDao.js';
import { createClanMessageRequest } from '../../dao/clansDao.js';
import { checkMessageCanBeDeleted } from '../../business/clanService.js';
import { findReadableMatchOfClan } from '../../business/clanChampionshipMatchService.js';
import {
	authenticate,
	connectUserToWsChannel,
	connectUserToSseChannel,
	processWsIncomingMessage,
	disconnectWsUser,
	setWsConnectionToAlive,
	checkIfWsClientsAreAlive,
	disconnectSseUser,
	sendSseMessageToUserInChannel,
	setWebSocketServer,
	publishToWsChannel,
	kickPlayerFromWsChannels
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
		await expect(authenticate(reqFor(WsChannel.CLAN_FORUM), ServerEventType.WEBSOCKET)).rejects.toThrow(
			'not in a clan'
		);
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
			{
				body: { channel: WsChannel.CLAN_FORUM },
				socket: { remoteAddress: ip },
				headers: { 'user-agent': ua }
			} as never,
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
			Buffer.from(JSON.stringify({ action: WsMessageAction.CREATE, message: '**hello** <i>' }))
		);
		expect(createClanMessageRequest).toHaveBeenCalledWith(1, expect.anything(), '<strong>hello</strong> &lt;i&gt;');
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
			{
				body: { channel: SseChannel.NOTIFICATION },
				socket: { remoteAddress: ip },
				headers: { 'user-agent': ua }
			} as never,
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

describe('championship channel', () => {
	const MATCH = 'a0000000-0000-4000-8000-000000000001';
	const ua = 'jest';

	async function ticketFor(playerId: string, ip: string, channel: string = WsChannel.CLAN_CHAMPIONSHIP) {
		vi.mocked(auth).mockResolvedValue({ id: playerId } as never);
		const dto = await authenticate(
			{ body: { channel }, socket: { remoteAddress: ip }, headers: { 'user-agent': ua } } as never,
			ServerEventType.WEBSOCKET
		);
		return dto.ticket;
	}

	async function connect(playerId: string, ip: string, channel?: string) {
		const ticket = await ticketFor(playerId, ip, channel);
		const ws = { id: '', isAlive: false } as any;
		await connectUserToWsChannel(ws, {
			url: `/ws?ticket=${ticket}`,
			socket: { remoteAddress: ip },
			headers: { 'user-agent': ua }
		} as never);
		const client = { id: ws.id, readyState: WebSocket.OPEN, send: vi.fn(), close: vi.fn() };
		return { ws, client };
	}

	beforeEach(() => {
		vi.mocked(getClanIdAndNameFromPlayerId).mockResolvedValue({ ClanMember: { clan: { id: 1 } } } as never);
		vi.mocked(findReadableMatchOfClan).mockResolvedValue({ id: MATCH } as never);
	});

	it('refuses the ticket to a player without a clan', async () => {
		vi.mocked(getClanIdAndNameFromPlayerId).mockResolvedValue({ ClanMember: null } as never);
		await expect(ticketFor('p-noclan', '2.0.0.1')).rejects.toThrow('not in a clan');
	});

	it('refuses the ticket to a player whose clan has no live or finished match', async () => {
		vi.mocked(findReadableMatchOfClan).mockResolvedValue(null);
		await expect(ticketFor('p-nomatch', '2.0.0.2')).rejects.toThrow();
		expect(findReadableMatchOfClan).toHaveBeenCalledWith(1);
	});

	it('names the channel after the match id and delivers only to its open connections', async () => {
		const a = await connect('p-a', '2.0.1.1');
		const b = await connect('p-b', '2.0.1.2');
		vi.mocked(findReadableMatchOfClan).mockResolvedValue({ id: 'other-match' } as never);
		const other = await connect('p-c', '2.0.1.3');
		const closed = await connect('p-d', '2.0.1.4');
		closed.client.readyState = WebSocket.CLOSED;
		setWebSocketServer({ clients: new Set([a.client, b.client, other.client, closed.client]) } as never);

		publishToWsChannel(`${WsChannel.CLAN_CHAMPIONSHIP}.${MATCH}`, { type: 'boardChanged', matchId: MATCH, version: 3 });

		const sent = (c: { send: ReturnType<typeof vi.fn> }) => c.send.mock.calls.map(([buf]) => buf.toString());
		const expected = JSON.stringify({ type: 'boardChanged', matchId: MATCH, version: 3 });
		expect(sent(a.client)).toEqual([expected]);
		expect(sent(b.client)).toEqual([expected]);
		expect(other.client.send).not.toHaveBeenCalled();
		expect(closed.client.send).not.toHaveBeenCalled();
		for (const c of [a, b, other, closed]) disconnectWsUser(c.ws);
	});

	it('sends the current board version to a socket that just joined the match channel', async () => {
		vi.mocked(findReadableMatchOfClan).mockResolvedValue({ id: MATCH, version: 9 } as never);
		const { ticket } = await authenticate(reqFor(WsChannel.CLAN_CHAMPIONSHIP), ServerEventType.WEBSOCKET);
		const ws = { id: '', isAlive: false, readyState: WebSocket.OPEN, send: vi.fn() } as any;
		await connectUserToWsChannel(ws, {
			url: `/ws?ticket=${ticket}`,
			socket: { remoteAddress: '1.2.3.4' },
			headers: { 'user-agent': 'jest' }
		} as never);
		expect(ws.send).toHaveBeenCalledTimes(1);
		expect(JSON.parse(ws.send.mock.calls[0][0])).toEqual({ type: 'boardChanged', matchId: MATCH, version: 9 });
		disconnectWsUser(ws);
	});

	it('publishToWsChannel is a no-op for an unknown channel', () => {
		const client = { id: 'x', readyState: WebSocket.OPEN, send: vi.fn() };
		setWebSocketServer({ clients: new Set([client]) } as never);
		expect(() => publishToWsChannel('WsClanChampionship.nope', { a: 1 })).not.toThrow();
		expect(client.send).not.toHaveBeenCalled();
	});

	it('ignores incoming messages on a championship channel', async () => {
		const a = await connect('p-e', '2.0.2.1');
		const wss = { clients: new Set([a.client]) } as never;
		await processWsIncomingMessage(
			wss,
			a.ws.id,
			Buffer.from(JSON.stringify({ action: WsMessageAction.CREATE, message: 'hello' }))
		);
		expect(createClanMessageRequest).not.toHaveBeenCalled();
		expect(a.client.send).not.toHaveBeenCalled();
		disconnectWsUser(a.ws);
	});

	it('kickPlayerFromWsChannels closes only that player matching connections', async () => {
		const kicked = await connect('p-kick', '2.0.3.1');
		const mate = await connect('p-mate', '2.0.3.2');
		const forum = await connect('p-kick', '2.0.3.3', WsChannel.CLAN_FORUM);
		const otherForum = await connect('p-kick', '2.0.3.4', WsChannel.CLAN_FORUM);
		void otherForum;
		setWebSocketServer({ clients: new Set([kicked.client, mate.client, forum.client]) } as never);

		kickPlayerFromWsChannels('p-kick', [`${WsChannel.CLAN_CHAMPIONSHIP}.`]);

		expect(kicked.client.close).toHaveBeenCalled();
		expect(mate.client.close).not.toHaveBeenCalled();
		expect(forum.client.close).not.toHaveBeenCalled();

		// Removed from the map: nothing is delivered to it any more.
		publishToWsChannel(`${WsChannel.CLAN_CHAMPIONSHIP}.${MATCH}`, { a: 1 });
		expect(kicked.client.send).not.toHaveBeenCalled();
		expect(mate.client.send).toHaveBeenCalledTimes(1);

		// The forum prefix of this clan kicks the forum connections.
		kickPlayerFromWsChannels('p-kick', [`${WsChannel.CLAN_FORUM}.1`]);
		expect(forum.client.close).toHaveBeenCalled();
		disconnectWsUser(mate.ws);
	});
});
