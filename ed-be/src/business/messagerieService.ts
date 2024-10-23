import { Request } from 'express';
import { auth } from '../dao/playerDao.js';
import {
	addMessage,
	changePinMessage,
	createConversation,
	getConversation,
	getConversationsWithPlayer
} from '../dao/messagerieDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

export async function getMyConversation(req: Request) {
	const authed = await auth(req);
	return await getConversationsWithPlayer(authed.id);
}

export async function startConversation(req: Request) {
	const authed = await auth(req);
	const title = req.body.title;
	const participants = req.body.participants;
	const message = req.body.message;

	return await createConversation(authed.id, participants, title, message);
}

export async function getFullConversattion(req: Request) {
	const authed = await auth(req);
	const conversation = await getConversation(req.params.thread);

	if (!conversation.participants.map(p => p.playerId).includes(authed.id)) {
		throw new ExpectedError(`notInConversation`);
	}

	return conversation;
}

export async function sendMessage(req: Request) {
	const authed = await auth(req);
	const conversation = await getConversation(req.params.thread);
	if (!conversation.participants.map(p => p.playerId).includes(authed.id)) {
		throw new ExpectedError(`notInConversation`);
	}

	return await addMessage(req.params.thread, req.body.content, authed.id);
}

export async function pinMesage(req: Request) {
	const authed = await auth(req);
	const conversation = await getConversation(req.params.thread);
	if (!conversation.participants.map(p => p.playerId).includes(authed.id)) {
		throw new ExpectedError(`notInConversation`);
	}
	const message = +req.body.messageId;
	const action = req.body.pin as boolean;
	if (conversation.messages.find(m => m.id === message)) {
		await changePinMessage(conversation.id, action ? message : null);
	}
}
