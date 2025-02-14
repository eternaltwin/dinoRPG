import { Request } from 'express';
import { WsTicket } from '@drpg/core/models/webSocket/WsTicket';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { wsTicketMaxTime } from '../constants/index.js';
import { WebSocketCustom } from '@drpg/core/models/webSocket/WebSocketCustom';
import { WebSocketServerCustom } from '@drpg/core/models/webSocket/WebSocketServerCustom';
import { ChannelData } from '@drpg/core/models/webSocket/ChannelData';
import { ChannelInfos } from '@drpg/core/models/webSocket/ChannelInfos';
import { RawData, WebSocket } from 'ws';
import { WsChannel } from '@drpg/core/models/webSocket/WsChannel';
import { auth, getClanIdAndNameFromPlayerId } from '../dao/playerDao.js';
import { createClanMessageRequest, deleteClanMessageRequest } from '../dao/clansDao.js';
import { CreateClanMessage } from '@drpg/core/models/clan/CreateClanMessage';
import { WsMsgRequest } from '@drpg/core/models/webSocket/WsMsgRequest';
import { WsMessageAction } from '@drpg/core/models/webSocket/WsMessageAction';
import { WsMsgResponse } from '@drpg/core/models/webSocket/WsMsgResponse';
import { WsMsgResponseDeletion } from '@drpg/core/models/webSocket/WsMsgResponseDeletion';
import { WsMsgResponseCreation } from '@drpg/core/models/webSocket/WsMsgResponseCreation';
import { checkMessageCanBeDeleted } from './clanService.js';
import { isJson } from '../utils/helpers/ValidatorHelper.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

let activeTickets: WsTicket[] = [];
const channels = new Map<string, ChannelData[]>();

export async function authenticate(req: Request) {
	doGenericVerificationsForWsAuthent(req);

	await doSpecificVerificationsForWsAuthent(req);

	const uuid = randomUUID();
	const ip = getIpAddressFromRequest(req);
	if (!ip) {
		throw new ExpectedError('No IP found.');
	}

	const headers = req.headers['user-agent'];
	if (!headers) {
		throw new ExpectedError('No headers found.');
	}

	const authed = await auth(req);

	activeTickets.push({
		uuid: uuid,
		channel: req.body.channel,
		userAgent: headers,
		ipAddress: ip,
		playerId: authed.id,
		timestamp: Date.now()
	});

	return uuid;
}

/**
 * Get IP address from request data. If the player is behind a proxy, the IP will be in the 'x-forwarded-for' header.
 *
 * @param req -> Request data
 * @returns -> The player IP address
 */
function getIpAddressFromRequest(req: Request | IncomingMessage): string | undefined {
	return req.socket.remoteAddress ?? (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim();
}

/**
 * Check if the data sent by the client is valid, this check is done for all incoming requests.
 *
 * @param req -> Express request
 * @throws {Error}
 */
function doGenericVerificationsForWsAuthent(req: Request) {
	if (getIpAddressFromRequest(req) === undefined) {
		throw new Error('The IP address was not found');
	}
}

/**
 * Check specific data about the channel that the player is trying to access.
 * For example, if the player tries to access his clan forum, we must check
 * that the player has a clan and etc...
 *
 * @param req -> Express request
 */
async function doSpecificVerificationsForWsAuthent(req: Request): Promise<void> {
	const authed = await auth(req);
	if (req.body.channel === WsChannel.CLAN_FORUM) {
		const clanForPlayer = await getClanIdAndNameFromPlayerId(authed.id);
		if (clanForPlayer.ClanMember === null) {
			throw new Error(`The player is not in a clan.`);
		}
	}
}

/**
 * Check the validity of a ticket and put the user into the channel that he wants.
 *
 * @param ws -> The WebSocket connection
 * @param req -> The request incoming
 */
export async function connectUserToChannel(ws: WebSocketCustom, req: IncomingMessage) {
	const ticketUuid = req.url?.split('?ticket=')[1];

	const ticket = checkTicketValidity(req, ticketUuid);

	// Set a unique identifier for the connection
	ws.id = randomUUID();
	ws.isAlive = true;
	// Remove the ticket in order to not use it twice
	activeTickets = activeTickets.filter(ticket => ticket.uuid !== ticketUuid);

	await putUserInChannel(ticket, ws.id);
}

/**
 * Do some verifications to be sure that the client trying to upgrade the connection to WebSocket
 * is the same than before.
 *
 * @param req -> Express request
 * @param ticketUuid -> unique identifier sent in params
 * @returns -> The ticket linked to the user
 */
function checkTicketValidity(req: IncomingMessage, ticketUuid: string | undefined): WsTicket {
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
async function putUserInChannel(ticket: WsTicket, wsId: string): Promise<void> {
	const channelName = await getChannelName(ticket);

	const channel = channels.get(channelName);

	if (channel !== undefined) {
		channel.push({ connectionId: wsId, playerId: ticket.playerId });
	} else {
		channels.set(channelName, [{ connectionId: wsId, playerId: ticket.playerId }]);
	}
}

async function getChannelName(ticket: WsTicket): Promise<string> {
	if (ticket.channel === WsChannel.CLAN_FORUM) {
		const playerData = await getClanIdAndNameFromPlayerId(ticket.playerId);
		if (!playerData.ClanMember)
			throw new ExpectedError(`The channel name is not correct. Ticket channel : ${ticket.channel}`);
		return `${ticket.channel}.${playerData.ClanMember.clan.name}`;
	}

	throw new Error(`The channel name is not correct. Ticket channel : ${ticket.channel}`);
}

/**
 * When a message is received by the server, we do some actions like a regular service.
 *
 * @param wss -> The WebSocket server
 * @param wsId -> The connection identifier
 * @param message -> The message sent by a user
 */
export async function processIncomingMessage(
	wss: WebSocketServerCustom,
	wsId: string,
	bufferedMessage: RawData
): Promise<void> {
	const channel = getChannelDetailsFromConnectionId(wsId);

	const message: WsMsgRequest = getMessageFromString(bufferedMessage);

	if (message.action === WsMessageAction.CREATE) {
		const dataSaved = await saveMessageInDatabase(channel, wsId, message.message);
		const msgResponse: WsMsgResponseCreation = { action: WsMessageAction.CREATE, payload: dataSaved };
		sendMessageToPeopleInChannel(wss, channel, msgResponse);
	} else if (message.action === WsMessageAction.DELETE) {
		const playerId = getPlayerWsDataFromChannelData(channel, wsId).playerId;
		await checkMessageCanBeDeleted(message.msgId, playerId);
		await deleteMessage(channel, wsId, message.msgId);
		const msgResponse: WsMsgResponseDeletion = { action: WsMessageAction.DELETE, msgId: message.msgId };
		sendMessageToPeopleInChannel(wss, channel, msgResponse);
	}
}

/**
 * Get the channel linked to the connection.
 *
 * @param wsId -> Connection identifier
 * @returns -> The channel wanted and players connected in this channel
 */
function getChannelDetailsFromConnectionId(wsId: string): ChannelInfos {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const channelData: [string, ChannelData[]] | undefined = [...channels.entries()].find(([_chanKey, chanValue]) =>
		chanValue.find(channel => channel.connectionId === wsId)
	);

	if (channelData === undefined) throw new Error('The channel cannot be undefined');

	const channelInfos: ChannelInfos = {
		channelName: channelData[0],
		members: channelData[1]
	};

	return channelInfos;
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

async function saveMessageInDatabase(channel: ChannelInfos, wsId: string, message: string): Promise<CreateClanMessage> {
	const wsData = getPlayerWsDataFromChannelData(channel, wsId);

	const playerInfos = await getClanIdAndNameFromPlayerId(wsData.playerId);

	if (!playerInfos.ClanMember) throw new ExpectedError(`The player is not in a clan`);
	return await createClanMessageRequest(playerInfos.ClanMember.clan.id, wsData.playerId, message.toString());
}

async function deleteMessage(channel: ChannelInfos, wsId: string, msgId: number) {
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
function getPlayerWsDataFromChannelData(channel: ChannelInfos, wsId: string): ChannelData {
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
function sendMessageToPeopleInChannel(wss: WebSocketServerCustom, channel: ChannelInfos, message: WsMsgResponse): void {
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
export function disconnectUser(ws: WebSocketCustom): void {
	const channel = getChannelDetailsFromConnectionId(ws.id);

	removeUserFromChannel(channel, ws.id);
}

/**
 * Remove player from the channel he wants to leave
 *
 * @param channel -> The channel that the player is leaving
 * @param wsId -> The connection identifier
 */
function removeUserFromChannel(channel: ChannelInfos, wsId: string) {
	const usersInChannel = channel.members.filter(user => user.connectionId !== wsId);

	if (usersInChannel.length === 0) {
		channels.delete(channel.channelName);
	} else {
		channels.set(channel.channelName, usersInChannel);
	}
}

/**
 * Sometimes the link between the server and the client can be interrupted in a way that keeps both the server
 * and the client unaware of the broken state of the connection.
 * In these cases ping messages can be used as a means to verify that the remote endpoint is still responsive.
 *
 * @param wss -> The WebSocketServer
 */
export function checkIfClientsAreAlive(wss: WebSocketServerCustom): void {
	wss.clients.forEach(ws => {
		if (ws.isAlive === false) {
			disconnectUser(ws);
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
export function setConnectionToAlive(ws: WebSocketCustom): void {
	ws.isAlive = true;
}
