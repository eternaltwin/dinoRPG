import { Request } from 'express';
import { WsTicket } from '@drpg/core/models/webSocket/WsTicket';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { wsTicketMaxTime } from '../constants/index.js';
import { WebSocketCustom } from '@drpg/core/models/webSocket/WebSocketCustom';
import { WebSocketServerCustom } from '@drpg/core/models/webSocket/WebSocketServerCustom';
import { ChannelData } from '@drpg/core/models/webSocket/ChannelData';
import { RawData, WebSocket } from 'ws';
import { LOGGER } from '../context.js';

let activeTickets: WsTicket[] = [];
const channels = new Map<string, ChannelData[]>();

export async function authenticate(req: Request) {
	doGenericVerificationsForWsAuthent(req);

	doSpecificVerificationsForWsAuthent(req);

	const uuid = randomUUID();

	activeTickets.push({
		uuid: uuid,
		channel: req.body.channel + 'nomDuClan' + req.auth!.playerId, // TODO: Do a specific channel for each clan
		userAgent: req.headers['user-agent']!,
		ipAddress: getIpAddressFromRequest(req)!,
		playerId: req.auth!.playerId!,
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
 * @param _req -> Express request
 */
function doSpecificVerificationsForWsAuthent(_req: Request) {
	// TODO: Do here specific verifications about channels.
}

/**
 * Check the validity of a ticket and put the user into the channel that he wants.
 *
 * @param ws -> The WebSocket connection
 * @param req -> The request incoming
 */
export function connectUserToChannel(ws: WebSocketCustom, req: IncomingMessage) {
	const ticketUuid = req.url?.split('?ticket=')[1];

	const ticket = checkTicketValidity(req, ticketUuid);

	// Set a unique identifier for the connection
	ws.id = randomUUID();
	ws.isAlive = true;
	// Remove the ticket in order to not use it twice
	activeTickets = activeTickets.filter(ticket => ticket.uuid !== ticketUuid);

	putUserInChannel(ticket, ws.id);
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
function putUserInChannel(ticket: WsTicket, wsId: string): void {
	const channel = channels.get(ticket.channel);

	if (channel !== undefined) {
		channel.push({ connectionId: wsId, playerId: ticket.playerId });
	} else {
		channels.set(ticket.channel, [{ connectionId: wsId, playerId: ticket.playerId }]);
	}
}

/**
 * When a message is received by the server, this one is sent to other users in the same channel.
 *
 * @param wss -> The WebSocket server
 * @param wsId -> The connection identifier
 * @param message -> The message sent by a user
 */
export function processIncomingMessage(wss: WebSocketServerCustom, wsId: string, message: RawData): void {
	const channel = getChannelDetailsFromConnectionId(wsId);

	sendMessageToPeopleInChannel(wss, channel, wsId, message);
}

/**
 * Get the channel linked to the connection.
 *
 * @param wsId -> Connection identifier
 * @returns -> The channel wanted and players connected in this channel
 */
function getChannelDetailsFromConnectionId(wsId: string): [string, ChannelData[]] | undefined {
	return [...channels.entries()].find(([_chanKey, chanValue]) =>
		chanValue.find(channel => channel.connectionId === wsId)
	);
}

/**
 * Send a message to all players who are in the channel sent in params
 *
 * @param wss -> The WebSocketServer
 * @param channel -> The channel into we want to send a message
 * @param wsId -> The connection identifier
 * @param message -> The message we want to send
 */
function sendMessageToPeopleInChannel(
	wss: WebSocketServerCustom,
	channel: [string, ChannelData[]] | undefined,
	wsId: string,
	message: RawData
): void {
	if (channel === undefined) {
		return;
	}

	LOGGER.log(`Message sent to channel ${channel[0]}: ${message}`);

	const usersInChannel = channel[1].filter(user => user.connectionId !== wsId);

	wss.clients.forEach(client => {
		const sendMessageToClient = usersInChannel.some(user => user.connectionId === client.id);
		if (sendMessageToClient && client.readyState === WebSocket.OPEN) {
			client.send(message, { binary: false });
		}
	});
}

/**
 * Get channel data and remove the player from the channel he wants to leave
 *
 * @param ws -> The WebSocket connection
 */
export function disconnectUser(ws: WebSocketCustom): void {
	const channel = getChannelDetailsFromConnectionId(ws.id);

	if (channel === undefined) {
		return;
	}

	removeUserFromChannel(channel, ws.id);
}

/**
 * Remove player from the channel he wants to leave
 *
 * @param channel -> The channel that the player is leaving
 * @param wsId -> The connection identifier
 */
function removeUserFromChannel(channel: [string, ChannelData[]], wsId: string) {
	const usersInChannel = channel[1].filter(user => user.connectionId !== wsId);

	if (usersInChannel.length === 0) {
		channels.delete(channel[0]);
	} else {
		channels.set(channel[0], usersInChannel);
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
