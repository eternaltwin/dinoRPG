import { Request, Response } from 'express';
import { ServerEventTicket } from '@drpg/core/models/serverEvents/ServerEventTicket';
import { ServerEventTicketDto } from '@drpg/core/models/serverEvents/ServerEventTicketDto';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { wsTicketMaxTime } from '../constants/index.js';
import { WebSocketCustom } from '@drpg/core/models/serverEvents/WebSocketCustom';
import { WebSocketServerCustom } from '@drpg/core/models/serverEvents/WebSocketServerCustom';
import { WsChannelData } from '@drpg/core/models/serverEvents/WsChannelData';
import { ChannelInfos } from '@drpg/core/models/serverEvents/ChannelInfos';
import { RawData, WebSocket } from 'ws';
import { WsChannel } from '@drpg/core/models/serverEvents/WsChannel';
import { Auth, auth, authPlayer, getClanIdAndNameFromPlayerId } from '../dao/playerDao.js';
import { createClanMessageRequest, deleteClanMessageRequest } from '../dao/clansDao.js';
import { CreateClanMessage } from '@drpg/core/models/clan/CreateClanMessage';
import { WsMsgRequest } from '@drpg/core/models/serverEvents/WsMsgRequest';
import { WsClanPresenceMessage, WsClanReadyMessage, WsClanRequest } from '@drpg/core/models/serverEvents/WsClanSocket';
import { WsMessageAction } from '@drpg/core/models/serverEvents/WsMessageAction';
import { WsMsgResponse } from '@drpg/core/models/serverEvents/WsMsgResponse';
import { WsMsgResponseDeletion } from '@drpg/core/models/serverEvents/WsMsgResponseDeletion';
import { WsMsgResponseCreation } from '@drpg/core/models/serverEvents/WsMsgResponseCreation';
import { checkMessageCanBeDeleted } from './clanService.js';
import { answerClanSocketRequest } from './clanSocketRequestService.js';
import { isJson } from '../utils/helpers/ValidatorHelper.js';
import { renderPlayerMessage } from '../utils/marktwin.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { GLOBAL, LOGGER } from '../context.js';
import { UUID } from 'node:crypto';
import { ServerEventType } from '@drpg/core/models/serverEvents/ServerEventType';
import { SseChannelData } from '@drpg/core/models/serverEvents/SseChannelData';
import { SseChannel } from '@drpg/core/models/serverEvents/SseChannel';
import { WsReadyStateName } from '@drpg/core/models/admin/ServerEventsMonitoring';
import { LiveStatsType } from '@drpg/core/models/store/LiveStats';

const activeTickets = new Map<string, ServerEventTicket>();
const wsChannels = new Map<string, WsChannelData[]>();
const sseChannels = new Map<string, SseChannelData[]>();
const ticketToChannelMap = new Map<string, string>();
let webSocketServer: WebSocketServerCustom | undefined;

/** What the admin panel shows about a WebSocket connection, kept from its registration to its disconnection. */
interface WsConnectionStats {
	channel: string;
	playerId: string;
	ip: string;
	userAgent: string;
	connectedAt: number;
	lastPingAt: number | null;
	lastPongAt: number | null;
	messagesIn: number;
	messagesOut: number;
	lastMessageInAt: number | null;
	lastMessageOutAt: number | null;
}
const wsStats = new Map<string, WsConnectionStats>();

function recordWsOut(connectionId: string): void {
	const stats = wsStats.get(connectionId);
	if (!stats) return;
	stats.messagesOut++;
	stats.lastMessageOutAt = Date.now();
}

/** Registers the running WebSocket server, so that services can push to channels without holding it. */
export function setWebSocketServer(wss: WebSocketServerCustom): void {
	webSocketServer = wss;
}

// Tickets garbage collector
setInterval(() => {
	const now = Date.now();
	const TIMEOUT = 60 * 1000;

	let count = 0;
	for (const [uuid, ticket] of activeTickets.entries()) {
		if (now - ticket.timestamp > TIMEOUT) {
			activeTickets.delete(uuid);
			count++;
		}
	}

	if (activeTickets.size > 100) {
		LOGGER.warn(`[SSE] Attention: ${activeTickets.size} tickets toujours en attente.`);
	}

	for (const [channelName, users] of sseChannels.entries()) {
		const activeUsers = users.filter(user => isSseResponseOpen(user.res));

		if (activeUsers.length === 0) {
			sseChannels.delete(channelName);
		} else if (activeUsers.length !== users.length) {
			sseChannels.set(channelName, activeUsers);
		}
	}
}, 60000);

function isSseResponseOpen(res: Response): boolean {
	return !res.writableEnded && !!res.socket && !res.socket.destroyed;
}

/**
 * Number of distinct players holding at least one open SSE stream. Derived from the channels themselves, so it cannot
 * drift from them whichever path (close event or garbage collector) removed a stream.
 */
export function countConnectedSsePlayers(): number {
	const players = new Set<string>();
	for (const users of sseChannels.values()) {
		for (const user of users) {
			if (isSseResponseOpen(user.res)) players.add(user.playerId);
		}
	}
	return players.size;
}

export function getLiveStatsSummary(): LiveStatsType {
	return GLOBAL.liveStats.summary(countConnectedSsePlayers());
}

export async function authenticate(req: Request, serverEventType: ServerEventType): Promise<ServerEventTicketDto> {
	const authed = await auth(req);

	const ip: string = getIpAddressFromRequest(req);
	await doSpecificVerifications(req, authed, serverEventType);

	const uuid: UUID = randomUUID();

	const userAgent: string = getUserAgentFromRequest(req);

	activeTickets.set(uuid, {
		uuid: uuid,
		channel: req.body.channel,
		userAgent,
		ipAddress: ip,
		playerId: authed.id,
		connexionToken: authed.connexionToken,
		timestamp: Date.now(),
		type: serverEventType
	});

	return {
		ticket: uuid
	};
}

/**
 * Get IP address from request data. If the player is behind a proxy, the IP will be in the 'x-forwarded-for' header.
 *
 * @param req -> Request data
 * @returns -> The player IP address
 */
function getIpAddressFromRequest(req: Request | IncomingMessage): string {
	const ip: string | undefined =
		req.socket.remoteAddress ?? (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim();
	if (ip === undefined) {
		throw new Error('The IP address was not found');
	}
	return ip;
}

/**
 * Get User-Agent from request data.
 *
 * @param req -> Request data
 * @return -> The User Agent of the player
 */
function getUserAgentFromRequest(req: Request | IncomingMessage): string {
	const userAgent: string | undefined = req.headers['user-agent'];
	if (userAgent === undefined) {
		throw new ExpectedError('No user-agent header found.');
	}
	return userAgent;
}

/**
 * Check specific data about the channel that the player is trying to access.
 * For example, if the player tries to access his clan forum, we must check
 * that the player has a clan and etc...
 *
 * @param req -> Express request
 * @param authed -> Player connection information
 * @param serverEventType -> Ws or SSE
 */
async function doSpecificVerifications(req: Request, authed: Auth, serverEventType: ServerEventType): Promise<void> {
	if (serverEventType === ServerEventType.WEBSOCKET) {
		await doSpecificVerificationsForWs(req, authed);
		return;
	}

	await doSpecificVerificationsForSse(req, authed);
}

async function doSpecificVerificationsForWs(req: Request, authed: Auth): Promise<void> {
	if (req.body.channel === WsChannel.CLAN_FORUM) {
		await checkPlayerIsInClan(authed);
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function doSpecificVerificationsForSse(_req: Request, _authed: Auth): Promise<void> {
	// Do nothing for now
	// Remove eslint annotations when an implementation is done
}

async function checkPlayerIsInClan(authed: Auth): Promise<void> {
	const clanForPlayer = await getClanIdAndNameFromPlayerId(authed.id);
	// Expected: a tab that missed the clan exit keeps asking for a ticket until it learns about it.
	if (clanForPlayer.ClanMember === null) {
		throw new ExpectedError(`The player is not in a clan.`);
	}
}

/**
 * Check the validity of a ticket and put the user into the channel that he wants.
 *
 * @param ws -> The WebSocket connection
 * @param req -> The request incoming
 */
export async function connectUserToWsChannel(ws: WebSocketCustom, req: IncomingMessage): Promise<void> {
	const ticketUuid: string = getTicketFromUrl(req);

	const ticket: ServerEventTicket = checkTicketValidity(req, ticketUuid);

	// Set a unique identifier for the connection
	ws.id = randomUUID();
	ws.isAlive = true;
	// Remove the ticket in order to not use it twice
	activeTickets.delete(ticketUuid);

	const channelName = await putUserInWsChannel(ticket, ws.id);
	wsStats.set(ws.id, {
		channel: channelName,
		playerId: ticket.playerId,
		ip: ticket.ipAddress,
		userAgent: ticket.userAgent,
		connectedAt: Date.now(),
		lastPingAt: null,
		lastPongAt: null,
		messagesIn: 0,
		messagesOut: 0,
		lastMessageInAt: null,
		lastMessageOutAt: null
	});
}

/**
 * Tells a client that the server now listens to its connection. Whatever a client sends before this is lost,
 * and any push it missed while connecting is covered by the read it does on `ready`.
 *
 * @param ws -> The WebSocket connection
 */
export function sendWsReady(ws: WebSocketCustom): void {
	if (ws.readyState !== WebSocket.OPEN) return;
	const message: WsClanReadyMessage = { type: 'ready' };
	ws.send(JSON.stringify(message));
	recordWsOut(ws.id);
	sendPresenceOnReady(ws);
}

function isClanChannel(channelName: string): boolean {
	return channelName.startsWith(`${WsChannel.CLAN_FORUM}.`);
}

function presenceOf(members: WsChannelData[]): WsClanPresenceMessage {
	return { type: 'presence', playerIds: [...new Set(members.map(member => member.playerId))] };
}

/** Tells the whole clan who is online now. Does nothing for another kind of channel or an empty one. */
function publishPresence(channelName: string): void {
	const members = wsChannels.get(channelName);
	if (!isClanChannel(channelName) || !members) return;
	publishToWsChannel(channelName, presenceOf(members));
}

/**
 * A ready connection learns who is online. The rest of the clan is told only when its player was not online yet:
 * another tab of the same player changes nothing for them.
 */
function sendPresenceOnReady(ws: WebSocketCustom): void {
	const entry = [...wsChannels.entries()].find(([, members]) => members.some(m => m.connectionId === ws.id));
	if (!entry || !isClanChannel(entry[0])) return;
	const [channelName, members] = entry;
	const self = members.find(member => member.connectionId === ws.id)!;
	const alreadyOnline = members.some(m => m.playerId === self.playerId && m.connectionId !== ws.id);
	if (!alreadyOnline) {
		publishPresence(channelName);
		return;
	}
	ws.send(JSON.stringify(presenceOf(members)));
	recordWsOut(ws.id);
}

/**
 * Do some verifications to be sure that the client trying to connect to WS or SSE
 * is the same as before.
 *
 * @param req -> Express request
 * @param ticketUuid -> unique identifier sent in params
 * @returns -> The ticket linked to the user
 */
function checkTicketValidity(req: IncomingMessage, ticketUuid: string | undefined): ServerEventTicket {
	if (!ticketUuid) {
		throw new Error('The ticket sent is not valid');
	}

	const ticketFound = activeTickets.get(ticketUuid);
	if (!ticketFound) {
		throw new Error("The ticket doesn't exist");
	}

	const isUserAgentTheSame = ticketFound.userAgent === req.headers['user-agent'];
	if (!isUserAgentTheSame) {
		throw new Error('The user-agent is different');
	}

	const isIpAddressTheSame = ticketFound.ipAddress === getIpAddressFromRequest(req);
	if (!isIpAddressTheSame) {
		throw new Error('The IP address is different');
	}

	const isTicketExpired = Date.now() - ticketFound.timestamp > wsTicketMaxTime;
	if (isTicketExpired) {
		throw new Error('The ticket is expired');
	}

	return ticketFound;
}

/**
 * In order to separate users, we put the user into a specific channel.
 * If the player sends a message, it will be sent to other players in this channel,
 * and not to the other ones.
 *
 * @param ticket -> The ticket linked to the user
 * @param wsId -> Connection identifier
 */
async function putUserInWsChannel(ticket: ServerEventTicket, wsId: string): Promise<string> {
	const { channelName } = await getChannelTarget(ticket);

	const channel: WsChannelData[] | undefined = wsChannels.get(channelName);
	const member: WsChannelData = {
		connectionId: wsId,
		playerId: ticket.playerId,
		connexionToken: ticket.connexionToken
	};

	if (channel !== undefined) {
		channel.push(member);
	} else {
		wsChannels.set(channelName, [member]);
	}
	return channelName;
}

/**
 * In order to separate users, we put the user into a specific channel.
 * Only players in this channel will get the server message.
 *
 * @param ticket -> The ticket linked to the user
 * @param ticketUuid -> Ticket got from URL
 * @param res -> The response from the incoming request. Kept alive while the connection is opened.
 */
async function putUserInSseChannel(ticket: ServerEventTicket, ticketUuid: string, res: Response): Promise<void> {
	const { channelName } = await getChannelTarget(ticket);

	ticketToChannelMap.set(ticketUuid, channelName);

	const channel = sseChannels.get(channelName) || [];
	channel.push({
		ticketUuid,
		playerId: ticket.playerId,
		res,
		ip: ticket.ipAddress,
		userAgent: ticket.userAgent,
		connectedAt: Date.now(),
		messagesOut: 0,
		lastMessageOutAt: null
	});
	sseChannels.set(channelName, channel);
}

type ChannelTarget = { channelName: string };

async function getChannelTarget(ticket: ServerEventTicket): Promise<ChannelTarget> {
	if (ticket.channel === WsChannel.CLAN_FORUM) {
		const playerData = await getClanIdAndNameFromPlayerId(ticket.playerId);
		if (!playerData.ClanMember)
			throw new ExpectedError(`The channel name is not correct. Ticket channel : ${ticket.channel}`);
		return { channelName: `${ticket.channel}.${playerData.ClanMember.clan.id}` };
	} else if (ticket.channel === SseChannel.NOTIFICATION) {
		return { channelName: ticket.channel };
	}

	throw new Error(`The channel name is not correct. Ticket channel : ${ticket.channel}`);
}

/**
 * When a WS message is received by the server, we do some actions like a regular service.
 *
 * @param wss -> The WebSocket server
 * @param wsId -> The connection identifier
 * @param bufferedMessage -> The message sent by a user
 */
export async function processWsIncomingMessage(
	wss: WebSocketServerCustom,
	wsId: string,
	bufferedMessage: RawData
): Promise<void> {
	const stats = wsStats.get(wsId);
	if (stats) {
		stats.messagesIn++;
		stats.lastMessageInAt = Date.now();
	}
	const channel: ChannelInfos = getWsChannelDetailsFromConnectionId(wsId);

	const message = getMessageFromString(bufferedMessage);
	const member = getPlayerWsDataFromChannelData(channel, wsId);

	if (isClanRequest(message)) {
		const response = await answerClanSocketRequest(member.playerId, member.connexionToken, message);
		sendMessageToWsConnection(wss, wsId, response);
		return;
	}

	// The ticket was checked at connection time, and this connection may have been open for hours.
	await authPlayer(member.playerId, member.connexionToken);

	if (message.action === WsMessageAction.CREATE) {
		const dataSaved = await saveWsMessageInDatabase(channel, wsId, message.message);
		const msgResponse: WsMsgResponseCreation = { action: WsMessageAction.CREATE, payload: dataSaved };
		sendMessageToPeopleInWsChannel(wss, channel, msgResponse);
	} else if (message.action === WsMessageAction.DELETE) {
		const playerId = getPlayerWsDataFromChannelData(channel, wsId).playerId;
		await checkMessageCanBeDeleted(message.msgId, playerId);
		await deleteWsMessage(channel, wsId, message.msgId);
		const msgResponse: WsMsgResponseDeletion = { action: WsMessageAction.DELETE, msgId: message.msgId };
		sendMessageToPeopleInWsChannel(wss, channel, msgResponse);
	}
}

/**
 * Get the channel linked to the connection.
 *
 * @param wsId -> Connection identifier
 * @returns -> The channel wanted and players connected in this channel
 */
function getWsChannelDetailsFromConnectionId(wsId: string): ChannelInfos {
	const channelData: [string, WsChannelData[]] | undefined = [...wsChannels.entries()].find(([, chanValue]) =>
		chanValue.find(channel => channel.connectionId === wsId)
	);

	if (channelData === undefined) {
		LOGGER.error(`getWsChannelDetailsFromConnectionId error, wsId is ${wsId}`, [...wsChannels.entries()]);
		throw new Error('The channel cannot be undefined');
	}

	return {
		channelName: channelData[0],
		members: channelData[1]
	};
}

/**
 * Get text message from row data
 *
 * @param message -> The message we want to get
 * @returns -> The message converted to string
 */
function getMessageFromString(message: RawData): WsMsgRequest | WsClanRequest {
	if (!isJson(message.toString())) throw new Error('The data sent is not a valid JSON object.');

	return JSON.parse(message.toString());
}

function isClanRequest(message: WsMsgRequest | WsClanRequest): message is WsClanRequest {
	return typeof (message as WsClanRequest).requestId === 'string';
}

async function saveWsMessageInDatabase(
	channel: ChannelInfos,
	wsId: string,
	message: string
): Promise<CreateClanMessage> {
	const wsData: WsChannelData = getPlayerWsDataFromChannelData(channel, wsId);

	const playerInfos = await getClanIdAndNameFromPlayerId(wsData.playerId);

	if (!playerInfos.ClanMember) throw new ExpectedError(`The player is not in a clan`);

	// The frontend refuses an empty or oversized message before sending it, so a refusal here
	// only reaches a client that skipped it — and costs that client its socket.
	const content = await renderPlayerMessage(message);
	return await createClanMessageRequest(playerInfos.ClanMember.clan.id, wsData.playerId, content);
}

async function deleteWsMessage(channel: ChannelInfos, wsId: string, msgId: number) {
	const wsData = getPlayerWsDataFromChannelData(channel, wsId);

	await deleteClanMessageRequest(msgId, wsData.playerId);
}

/**
 * Extract player infos from all player connected to a channel
 *
 * @param channel -> All channel data
 * @param wsId -> The connection identifier we want to retrieve data
 * @returns -> The player data
 */
function getPlayerWsDataFromChannelData(channel: ChannelInfos, wsId: string): WsChannelData {
	const channelData = channel.members.find(user => user.connectionId === wsId);

	if (channelData === undefined) throw new Error('Ws data cannot be undefined');

	return channelData;
}

/**
 * Send a message to all players who are in the channel sent in params
 *
 * @param wss -> The WebSocketServer
 * @param channel -> The channel into we want to send a message
 * @param message -> The message we want to send
 */
function sendMessageToPeopleInWsChannel(
	wss: WebSocketServerCustom,
	channel: ChannelInfos,
	message: WsMsgResponse
): void {
	wss.clients.forEach(client => {
		const sendMessageToClient = channel.members.some(user => user.connectionId === client.id);
		if (!sendMessageToClient || client.readyState !== WebSocket.OPEN) {
			return;
		}

		client.send(Buffer.from(JSON.stringify(message)), { binary: false });
		recordWsOut(client.id);
	});
}

/** Send a message to one connection only. Does nothing if it is gone. */
function sendMessageToWsConnection(wss: WebSocketServerCustom, wsId: string, message: object): void {
	for (const client of wss.clients) {
		if (client.id !== wsId) continue;
		if (client.readyState === WebSocket.OPEN) {
			client.send(Buffer.from(JSON.stringify(message)), { binary: false });
			recordWsOut(client.id);
		}
		return;
	}
}

/**
 * Send a message to every open connection of a channel. Does nothing for an unknown channel.
 *
 * @param channelName -> The channel, e.g. `WsClanForum.<clanId>`
 * @param message -> The message to send, serialised as JSON
 */
export function publishToWsChannel(channelName: string, message: object): void {
	const members = wsChannels.get(channelName);
	if (!members || !webSocketServer) return;
	const payload = Buffer.from(JSON.stringify(message));
	webSocketServer.clients.forEach(client => {
		if (client.readyState !== WebSocket.OPEN || !members.some(user => user.connectionId === client.id)) return;
		client.send(payload, { binary: false });
		recordWsOut(client.id);
	});
}

/**
 * Send a message to every open connection of every channel whose name starts with the prefix.
 *
 * @param prefix -> e.g. `WsClanForum.` for all the clans
 * @param message -> The message to send, serialised as JSON
 */
export function publishToWsChannelFamily(prefix: string, message: object): void {
	if (!webSocketServer) return;
	const connectionIds = new Set<string>();
	for (const [channelName, members] of wsChannels.entries()) {
		if (channelName.startsWith(prefix)) members.forEach(member => connectionIds.add(member.connectionId));
	}
	if (connectionIds.size === 0) return;
	const payload = Buffer.from(JSON.stringify(message));
	webSocketServer.clients.forEach(client => {
		if (client.readyState !== WebSocket.OPEN || !connectionIds.has(client.id)) return;
		client.send(payload, { binary: false });
		recordWsOut(client.id);
	});
}

/**
 * Closes the connections of a player on the channels whose name starts with one of the prefixes,
 * and forgets them. Used when a player loses the right to follow a channel (clan exit).
 *
 * @param playerId -> The player to disconnect
 * @param channelPrefixes -> e.g. `WsClanForum.<clanId>`
 */
export function kickPlayerFromWsChannels(playerId: string, channelPrefixes: string[]): void {
	for (const [channelName, members] of [...wsChannels.entries()]) {
		// A prefix ending with a dot matches a family of channels; otherwise the name must be exactly the prefix
		// (`WsClanForum.1` must not kick from `WsClanForum.10`).
		if (
			!channelPrefixes.some(prefix => (prefix.endsWith('.') ? channelName.startsWith(prefix) : channelName === prefix))
		)
			continue;
		const kicked = members.filter(user => user.playerId === playerId);
		if (kicked.length === 0) continue;

		const remaining = members.filter(user => user.playerId !== playerId);
		if (remaining.length === 0) wsChannels.delete(channelName);
		else wsChannels.set(channelName, remaining);
		publishPresence(channelName);

		webSocketServer?.clients.forEach(client => {
			if (kicked.some(user => user.connectionId === client.id)) client.close();
		});
	}
}

/**
 * Get channel data and remove the player from the channel he wants to leave
 *
 * @param ws -> The WebSocket connection
 */
export function disconnectWsUser(ws: WebSocketCustom): void {
	wsStats.delete(ws.id);
	// A connection already removed (kicked) has nothing left to clean.
	const known = [...wsChannels.values()].some(members => members.some(user => user.connectionId === ws.id));
	if (!known) return;
	const channel = getWsChannelDetailsFromConnectionId(ws.id);

	removeUserFromWsChannel(channel, ws.id);
}

/**
 * Remove player from the channel he wants to leave
 *
 * @param channel -> The channel that the player is leaving
 * @param wsId -> The connection identifier
 */
function removeUserFromWsChannel(channel: ChannelInfos, wsId: string) {
	const usersInChannel = channel.members.filter(user => user.connectionId !== wsId);

	if (usersInChannel.length === 0) {
		wsChannels.delete(channel.channelName);
		return;
	}
	wsChannels.set(channel.channelName, usersInChannel);

	// The player went offline only if it was their last connection to the channel
	const leaving = channel.members.find(user => user.connectionId === wsId);
	if (leaving && !usersInChannel.some(user => user.playerId === leaving.playerId)) publishPresence(channel.channelName);
}

/**
 * Sometimes the link between the server and the client can be interrupted in a way that keeps both the server
 * and the client unaware of the broken state of the connection.
 * In these cases ping messages can be used as a means to verify that the remote endpoint is still responsive.
 *
 * @param wss -> The WebSocketServer
 */
export function checkIfWsClientsAreAlive(wss: WebSocketServerCustom): void {
	wss.clients.forEach(ws => {
		if (ws.isAlive === false) {
			disconnectWsUser(ws);
			return ws.terminate();
		}

		ws.isAlive = false;
		const stats = wsStats.get(ws.id);
		if (stats) stats.lastPingAt = Date.now();
		ws.ping();
	});
}

/**
 * When we receive a pong response from the client, we are sure that the connection is still alive.
 *
 * @param ws -> The WebSocket connection
 */
export function setWsConnectionToAlive(ws: WebSocketCustom): void {
	ws.isAlive = true;
	const stats = wsStats.get(ws.id);
	if (stats) stats.lastPongAt = Date.now();
}

/**
 * Check the validity of a ticket and put the user into the channel that he wants.
 *
 * @param req -> The incoming request
 * @param res -> The incoming response
 */
export async function connectUserToSseChannel(req: Request, res: Response): Promise<void> {
	const ticketUuid: string = getTicketFromUrl(req);

	const ticket: ServerEventTicket = checkTicketValidity(req, ticketUuid);

	// Remove the ticket in order to not use it twice
	activeTickets.delete(ticketUuid);

	await putUserInSseChannel(ticket, ticketUuid, res);
}

/**
 * Remove user from the SSE channel he wants to leave. Close the connection to prevent overflow.
 *
 * @param req -> The request used to open the SSE connection
 */
export async function disconnectSseUser(req: Request): Promise<void> {
	const ticketUuid: string = getTicketFromUrl(req);
	const channelName = ticketToChannelMap.get(ticketUuid);

	if (!channelName) {
		LOGGER.warn(`[SSE] Tentative de déconnexion d'un ticket inexistant: ${ticketUuid}`);
		return;
	}

	const channelData = sseChannels.get(channelName);
	if (channelData) {
		const usersLeftInChannel = channelData.filter(player => player.ticketUuid !== ticketUuid);

		if (usersLeftInChannel.length === 0) {
			sseChannels.delete(channelName);
		} else {
			sseChannels.set(channelName, usersLeftInChannel);
		}
	}

	ticketToChannelMap.delete(ticketUuid);
}

/**
 * Send message to user from the SSE channel
 *
 * @param playerId the player to send the message to
 * @param channelName the channel that should contain the user
 * @param message the message to send
 */
export async function sendSseMessageToUserInChannel(
	playerId: string,
	channelName: SseChannel,
	message: object
): Promise<void> {
	// Get channel
	const channel = sseChannels.get(channelName);

	if (channel === undefined) {
		return;
	}

	// Get user in channel
	const player = channel.find(c => c.playerId === playerId);
	if (!player) {
		// LOGGER.info(`User ${playerId} is not in channel ${channelName}`);
		return;
	}

	// Send message
	const data = `data: ${JSON.stringify(message)}\n\n`;
	player.res.write(data);
	player.messagesOut++;
	player.lastMessageOutAt = Date.now();
}

/**
 * Retrieve ticket from URL for SSE and WS connection
 *
 * @param req -> The request used to open the SSE connection
 */
function getTicketFromUrl(req: Request | IncomingMessage): string {
	const ticket: string | undefined = req.url?.split('?ticket=')[1];

	if (ticket === undefined) {
		throw new Error('The ticket must be sent');
	}

	return ticket;
}

const WS_READY_STATES: WsReadyStateName[] = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];

export interface RawWsConnection {
	connectionId: string | null;
	readyState: WsReadyStateName;
	isAlive: boolean;
	bufferedAmount: number;
	stats: WsConnectionStats | null;
	orphan: boolean;
}

export interface RawServerEventsSnapshot {
	wsServerRunning: boolean;
	pendingTickets: { websocket: number; sse: number; oldestAgeMs: number | null };
	wsConnections: RawWsConnection[];
	wsChannels: { channel: string; members: Pick<WsChannelData, 'connectionId' | 'playerId'>[]; ghostMembers: number }[];
	sseConnections: (Omit<SseChannelData, 'res' | 'ticketUuid'> & { channel: string; open: boolean })[];
}

/**
 * Everything the server knows about its live connections, for the admin panel. Read-only: it changes nothing.
 */
export function getServerEventsSnapshot(): RawServerEventsSnapshot {
	const now = Date.now();
	const tickets = [...activeTickets.values()];
	const oldestTicket = tickets.reduce<number | null>(
		(oldest, ticket) => (oldest === null || ticket.timestamp < oldest ? ticket.timestamp : oldest),
		null
	);

	const channelMemberIds = new Set<string>();
	for (const members of wsChannels.values()) members.forEach(member => channelMemberIds.add(member.connectionId));

	const clients = webSocketServer ? [...webSocketServer.clients] : [];
	const liveIds = new Set(clients.map(client => client.id).filter(Boolean));

	const wsConnections: RawWsConnection[] = clients.map(client => ({
		connectionId: client.id || null,
		readyState: WS_READY_STATES[client.readyState] ?? 'CLOSED',
		isAlive: client.isAlive !== false,
		bufferedAmount: client.bufferedAmount ?? 0,
		stats: (client.id && wsStats.get(client.id)) || null,
		orphan: !!client.id && !channelMemberIds.has(client.id)
	}));

	return {
		wsServerRunning: webSocketServer !== undefined,
		pendingTickets: {
			websocket: tickets.filter(ticket => ticket.type === ServerEventType.WEBSOCKET).length,
			sse: tickets.filter(ticket => ticket.type === ServerEventType.SSE).length,
			oldestAgeMs: oldestTicket === null ? null : now - oldestTicket
		},
		wsConnections,
		wsChannels: [...wsChannels.entries()].map(([channel, members]) => ({
			channel,
			// The connexion token stays here.
			members: members.map(({ connectionId, playerId }) => ({ connectionId, playerId })),
			ghostMembers: members.filter(member => !liveIds.has(member.connectionId)).length
		})),
		sseConnections: [...sseChannels.entries()].flatMap(([channel, members]) =>
			members.map(member => ({
				channel,
				playerId: member.playerId,
				ip: member.ip,
				userAgent: member.userAgent,
				connectedAt: member.connectedAt,
				messagesOut: member.messagesOut,
				lastMessageOutAt: member.lastMessageOutAt,
				open: isSseResponseOpen(member.res)
			}))
		)
	};
}
