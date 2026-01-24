import { http } from '../utils/index.js';
import { FullThread, Message, ThreadsBasic } from '@drpg/core/models/messagerie/threadsBasic';

export const MessagerieService = {
	async getThread(threadId: string): Promise<FullThread> {
		const res = await http().get(`/messagerie/getThread/${threadId}`);
		return res.data;
	},
	async getThreads(): Promise<ThreadsBasic[]> {
		const res = await http().get(`/messagerie/getThreads`);
		return res.data;
	},
	async loadMessages(threadId: string, page: number): Promise<{ messages: Message[] }> {
		const res = await http().get(`/messagerie/loadThread/${threadId}/${page}`);
		return res.data;
	},
	async createThread(participants: string[], title: string, message: string): Promise<ThreadsBasic> {
		const res = await http().post(`/messagerie/create`, {
			participants: participants,
			title: title,
			message: message
		});
		return res.data;
	},
	async answerThread(thread: string, content: string): Promise<{ messages: Message[] }> {
		const res = await http().post(`/messagerie/send/${thread}`, {
			content: content
		});
		return res.data;
	},
	async pinMessage(thread: string, messageId: number, pin: boolean) {
		const res = await http().post(`/messagerie/pin/${thread}`, {
			messageId: messageId,
			pin: pin
		});
		return res.data;
	}
};
