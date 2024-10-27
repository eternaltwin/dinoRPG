import { Request } from 'express';
import { auth } from '../dao/playerDao.js';
import {
	addMessage,
	changePinMessage,
	createConversation,
	getConversation,
	getConversationsWithPlayer,
	getMoreMessages
} from '../dao/messagerieDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';

export async function getMyConversation(req: Request) {
	const authed = await auth(req);
	return await getConversationsWithPlayer(authed.id);
}

export async function startConversation(req: Request) {
	const authed = await auth(req);
	const title = req.body.title;
	const participants = req.body.participants;
	const message = req.body.message;

	if (participants.length > 9) {
		throw new ExpectedError(translate('maxParticipantInThread', authed));
	}

	return await createConversation(authed.id, participants, title, message);
}

export async function getFullConversattion(req: Request) {
	const authed = await auth(req);
	const conversation = await getConversation(req.params.thread, +req.params.page);

	if (!conversation.participants.map(p => p.playerId).includes(authed.id)) {
		throw new ExpectedError(translate(`notInConversation`, authed));
	}

	return conversation;
}

export async function loadMessages(req: Request) {
	const authed = await auth(req);
	const conversation = await getMoreMessages(req.params.thread, +req.params.page);

	if (!conversation.participants.map(p => p.playerId).includes(authed.id)) {
		throw new ExpectedError(translate(`notInConversation`, authed));
	}

	return conversation;
}

export async function sendMessage(req: Request) {
	const authed = await auth(req);
	const conversation = await getConversation(req.params.thread, 1);
	if (!conversation.participants.map(p => p.playerId).includes(authed.id)) {
		throw new ExpectedError(translate(`notInConversation`, authed));
	}

	return await addMessage(req.params.thread, req.body.content, authed.id);
}

export async function pinMesage(req: Request) {
	const authed = await auth(req);
	const conversation = await getConversation(req.params.thread, 1);
	if (!conversation.participants.map(p => p.playerId).includes(authed.id)) {
		throw new ExpectedError(translate(`notInConversation`, authed));
	}
	const message = +req.body.messageId;
	const action = req.body.pin as boolean;
	if (conversation.messages.find(m => m.id === message)) {
		await changePinMessage(conversation.id, action ? message : null);
	}
}
