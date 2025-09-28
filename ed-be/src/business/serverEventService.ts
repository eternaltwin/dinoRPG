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
import { auth, getClanIdAndNameFromPlayerId } from '../dao/playerDao.js';
import { createClanMessageRequest, deleteClanMessageRequest } from '../dao/clansDao.js';
import { CreateClanMessage } from '@drpg/core/models/clan/CreateClanMessage';
import { WsMsgRequest } from '@drpg/core/models/serverEvents/WsMsgRequest';
import { WsMessageAction } from '@drpg/core/models/serverEvents/WsMessageAction';
import { WsMsgResponse } from '@drpg/core/models/serverEvents/WsMsgResponse';
import { WsMsgResponseDeletion } from '@drpg/core/models/serverEvents/WsMsgResponseDeletion';
import { WsMsgResponseCreation } from '@drpg/core/models/serverEvents/WsMsgResponseCreation';
import { checkMessageCanBeDeleted } from './clanService.js';
import { isJson } from '../utils/helpers/ValidatorHelper.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { LOGGER } from '../context.js';
import { UUID } from 'node:crypto';
import { ServerEventType } from '@drpg/core/models/serverEvents/ServerEventType';
import { SseChannel } from '@drpg/core/models/serverEvents/SseChannel';
import { SseChannelData } from '@drpg/core/models/serverEvents/SseChannelData';

let activeTickets: ServerEventTicket[] = [];
const wsChannels = new Map<string, WsChannelData[]>();
const sseChannels = new Map<string, SseChannelData[]>();

export async function authenticate(req: Request, serverEventType: ServerEventType): Promise<ServerEventTicketDto> {
	const authed = await auth(req);

	const ip: string = getIpAddressFromRequest(req);
	await doSpecificVerifications(req, authed, serverEventType);

	const uuid: UUID = randomUUID();

	const userAgent: string = getUserAgentFromRequest(req);

	activeTickets.push({
		uuid: uuid,
		channel: req.body.channel,
		userAgent,
		ipAddress: ip,
		playerId: authed.id,
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
	const ip: string | undefined = req.socket.remoteAddress ?? (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim();
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
 */
// TODO: A FIX ABSOLUMENT !!! LE AUTH N'A PAS DE TYPE !!!!!!
/* eslint-disable  @typescript-eslint/no-explicit-any */
async function doSpecificVerifications(req: Request, authed: any, serverEventType: ServerEventType): Promise<void> {
	if (serverEventType === ServerEventType.WEBSOCKET) {
		await doSpecificVerificationsForWs(req, authed);
		return;
	}

	await doSpecificVerificationsForSse(req, authed);
}

// TODO: A FIX ABSOLUMENT !!! LE AUTH N'A PAS DE TYPE !!!!!!
/* eslint-disable  @typescript-eslint/no-explicit-any */
async function doSpecificVerificationsForWs(req: Request, authed: any): Promise<void> {
	if (req.body.channel === WsChannel.CLAN_FORUM) {
		await checkPlayerIsInClan(authed);
	}
}

// TODO: A FIX ABSOLUMENT !!! LE AUTH N'A PAS DE TYPE !!!!!!
/* eslint-disable  @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function doSpecificVerificationsForSse(_req: Request, _authed: any): Promise<void> {
	// Do nothing for now
	// Remove eslint annotations when an implementation is done
}

// TODO: A FIX ABSOLUMENT !!! LE AUTH N'A PAS DE TYPE !!!!!!
/* eslint-disable  @typescript-eslint/no-explicit-any */
async function checkPlayerIsInClan(authed: any): Promise<void> {
	const clanForPlayer = await getClanIdAndNameFromPlayerId(authed.id);
	if (clanForPlayer.ClanMember === null) {
		throw new Error(`The player is not in a clan.`);
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
	activeTickets = activeTickets.filter(ticket => ticket.uuid !== ticketUuid);

	await putUserInWsChannel(ticket, ws.id);
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

	const ticketFound = activeTickets.find(activeTicket => activeTicket.uuid === ticketUuid);
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
async function putUserInWsChannel(ticket: ServerEventTicket, wsId: string): Promise<void> {
	const channelName = await getChannelName(ticket);

	const channel: WsChannelData[] | undefined = wsChannels.get(channelName);

	if (channel !== undefined) {
		channel.push({ connectionId: wsId, playerId: ticket.playerId });
	} else {
		wsChannels.set(channelName, [{ connectionId: wsId, playerId: ticket.playerId }]);
	}
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
	const channelName = await getChannelName(ticket);

	const channel: SseChannelData[] | undefined = sseChannels.get(channelName);

	if (channel !== undefined) {
		channel.push({ ticketUuid, playerId: ticket.playerId, res });
	} else {
		sseChannels.set(channelName, [{ ticketUuid, playerId: ticket.playerId, res }]);
	}
}

async function getChannelName(ticket: ServerEventTicket): Promise<string> {
	if (ticket.channel === WsChannel.CLAN_FORUM) {
		const playerData = await getClanIdAndNameFromPlayerId(ticket.playerId);
		if (!playerData.ClanMember)
			throw new ExpectedError(`The channel name is not correct. Ticket channel : ${ticket.channel}`);
		return `${ticket.channel}.${playerData.ClanMember.clan.name}`;
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
	const channel: ChannelInfos = getWsChannelDetailsFromConnectionId(wsId);

	const message: WsMsgRequest = getMessageFromString(bufferedMessage);

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

	LOGGER.error([...wsChannels.entries()]);
	console.log([...wsChannels.entries()]);

	if (channelData === undefined) {
		LOGGER.error(`getWsChannelDetailsFromConnectionId error, wsId is ${wsId}`);
		LOGGER.error([...wsChannels.entries()]);
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
function getMessageFromString(message: RawData): WsMsgRequest {
	if (!isJson(message.toString())) throw new Error('The data sent is not a valid JSON object.');

	return JSON.parse(message.toString());
}

async function saveWsMessageInDatabase(channel: ChannelInfos, wsId: string, message: string): Promise<CreateClanMessage> {
	const wsData: WsChannelData = getPlayerWsDataFromChannelData(channel, wsId);

	const playerInfos = await getClanIdAndNameFromPlayerId(wsData.playerId);

	if (!playerInfos.ClanMember) throw new ExpectedError(`The player is not in a clan`);

	return await createClanMessageRequest(playerInfos.ClanMember.clan.id, wsData.playerId, message.toString());
}

async function deleteWsMessage(channel: ChannelInfos, wsId: string, msgId: number) {
	const wsData = getPlayerWsDataFromChannelData(channel, wsId);

	deleteClanMessageRequest(msgId, wsData.playerId);
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
function sendMessageToPeopleInWsChannel(wss: WebSocketServerCustom, channel: ChannelInfos, message: WsMsgResponse): void {
	wss.clients.forEach(client => {
		const sendMessageToClient = channel.members.some(user => user.connectionId === client.id);
		if (!sendMessageToClient || client.readyState !== WebSocket.OPEN) {
			return;
		}

		client.send(Buffer.from(JSON.stringify(message)), { binary: false });
	});
}

/**
 * Get channel data and remove the player from the channel he wants to leave
 *
 * @param ws -> The WebSocket connection
 */
export function disconnectWsUser(ws: WebSocketCustom): void {
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
	} else {
		wsChannels.set(channel.channelName, usersInChannel);
	}
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
	activeTickets = activeTickets.filter(ticket => ticket.uuid !== ticketUuid);

	await putUserInSseChannel(ticket, ticketUuid, res);
}

/**
 * Remove user from the SSE channel he wants to leave. Close the connection to prevent overflow.
 *
 * @param req -> The request used to open the SSE connection
 */
export async function disconnectSseUser(req: Request): Promise<void> {
	const ticketUuid: string = getTicketFromUrl(req);

	const channel = Array.from(sseChannels).find(([, sseChannelData]) =>
		sseChannelData.some(player => player.ticketUuid === ticketUuid));

	if (channel === undefined) {
		throw new Error("User must be in a channel");
	}

	const [channelName, channelData] = channel;
	const userInChannel: SseChannelData | undefined = channelData.find(player => player.ticketUuid === ticketUuid);

	if (userInChannel === undefined) {
		throw new Error("User not found in SSE channel.")
	}

	userInChannel.res.end();

	const usersInChannel: SseChannelData[] = channelData.filter(player => player.ticketUuid !== ticketUuid);

	if (channelData.length === 1) {
		sseChannels.delete(channelName);
	} else {
		sseChannels.set(channelName, usersInChannel);
	}
}

/**
 * Retrieve ticket from URL for SSE and WS connection
 *
 * @param req -> The request used to open the SSE connection
 */
function getTicketFromUrl(req: Request | IncomingMessage): string {
	const ticket: string | undefined = req.url?.split('?ticket=')[1];

	if (ticket === undefined) {
		throw new Error("The ticket must be send");
	}

	return ticket;
}
