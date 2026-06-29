import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/messagerieDao.js', () => ({
	addMessage: vi.fn(),
	changePinMessage: vi.fn(),
	createConversation: vi.fn(),
	getConversation: vi.fn(),
	getConversationsWithPlayer: vi.fn(),
	getMoreMessages: vi.fn()
}));
vi.mock('../../dao/notificationDao.js', () => ({ createNotification: vi.fn(), readNotificationFromMessages: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));

import { auth } from '../../dao/playerDao.js';
import * as dao from '../../dao/messagerieDao.js';
import { createNotification } from '../../dao/notificationDao.js';
import {
	getMyConversation,
	startConversation,
	getFullConversattion,
	loadMessages,
	sendMessage,
	pinMesage
} from '../../business/messagerieService.js';

const req = (params = {}, body = {}) => makeRequest({ params, body });

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
});

describe('messagerieService', () => {
	it('getMyConversation', async () => {
		vi.mocked(dao.getConversationsWithPlayer).mockResolvedValue(['c'] as never);
		expect(await getMyConversation(req())).toEqual(['c']);
	});

	it('startConversation creates and notifies others', async () => {
		vi.mocked(dao.createConversation).mockResolvedValue({ id: 'conv' } as never);
		await startConversation(req({}, { title: 't', participants: ['p1', 'p2', 'p3'], message: 'hi' }));
		expect(createNotification).toHaveBeenCalledTimes(2);
	});
	it('startConversation throws when too many participants', async () => {
		await expect(
			startConversation(req({}, { participants: Array.from({ length: 10 }, (_, i) => `p${i}`) }))
		).rejects.toThrow('maxParticipantInThread');
	});

	it('getFullConversattion returns conversation for participant', async () => {
		vi.mocked(dao.getConversation).mockResolvedValue({ id: 'c', participants: [{ player: { id: 'p1' } }] } as never);
		const result = await getFullConversattion(req({ thread: 'c' }));
		expect(result.id).toBe('c');
	});
	it('getFullConversattion throws when not a participant', async () => {
		vi.mocked(dao.getConversation).mockResolvedValue({ id: 'c', participants: [{ player: { id: 'other' } }] } as never);
		await expect(getFullConversattion(req({ thread: 'c' }))).rejects.toThrow('notInConversation');
	});

	it('loadMessages returns more messages for participant', async () => {
		vi.mocked(dao.getMoreMessages).mockResolvedValue({ participants: [{ playerId: 'p1' }] } as never);
		expect(await loadMessages(req({ thread: 'c', page: '1' }))).toBeDefined();
	});
	it('loadMessages throws when not a participant', async () => {
		vi.mocked(dao.getMoreMessages).mockResolvedValue({ participants: [{ playerId: 'other' }] } as never);
		await expect(loadMessages(req({ thread: 'c', page: '1' }))).rejects.toThrow('notInConversation');
	});

	it('sendMessage notifies others and adds message', async () => {
		vi.mocked(dao.getConversation).mockResolvedValue({
			id: 'c',
			participants: [{ player: { id: 'p1' } }, { player: { id: 'p2' } }]
		} as never);
		vi.mocked(dao.addMessage).mockResolvedValue({ id: 'm' } as never);
		await sendMessage(req({ thread: 'c' }, { content: 'hello' }));
		expect(createNotification).toHaveBeenCalledTimes(1);
		expect(dao.addMessage).toHaveBeenCalled();
	});
	it('sendMessage throws when not a participant', async () => {
		vi.mocked(dao.getConversation).mockResolvedValue({ id: 'c', participants: [{ player: { id: 'other' } }] } as never);
		await expect(sendMessage(req({ thread: 'c' }, { content: 'x' }))).rejects.toThrow('notInConversation');
	});

	it('pinMesage pins an existing message', async () => {
		vi.mocked(dao.getConversation).mockResolvedValue({
			id: 'c',
			participants: [{ player: { id: 'p1' } }],
			messages: [{ id: 5 }]
		} as never);
		await pinMesage(req({ thread: 'c' }, { messageId: '5', pin: true }));
		expect(dao.changePinMessage).toHaveBeenCalledWith('c', 5);
	});
	it('pinMesage unpins when pin false', async () => {
		vi.mocked(dao.getConversation).mockResolvedValue({
			id: 'c',
			participants: [{ player: { id: 'p1' } }],
			messages: [{ id: 5 }]
		} as never);
		await pinMesage(req({ thread: 'c' }, { messageId: '5', pin: false }));
		expect(dao.changePinMessage).toHaveBeenCalledWith('c', null);
	});
	it('pinMesage throws when not a participant', async () => {
		vi.mocked(dao.getConversation).mockResolvedValue({
			id: 'c',
			participants: [{ player: { id: 'other' } }],
			messages: []
		} as never);
		await expect(pinMesage(req({ thread: 'c' }, { messageId: '5' }))).rejects.toThrow('notInConversation');
	});
});
