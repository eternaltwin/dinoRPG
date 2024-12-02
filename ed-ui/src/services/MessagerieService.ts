import { http } from '../utils/index.js';
import { FullThread, Message, ThreadsBasic } from '@drpg/core/models/messagerie/threadsBasic';

export const MessagerieService = {
	getThread(threadId: string): Promise<FullThread> {
		return http()
			.get(`/messagerie/getThread/${threadId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getThreads(): Promise<ThreadsBasic[]> {
		return http()
			.get(`/messagerie/getThreads`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	loadMessages(threadId: string, page: number): Promise<{ messages: Message[] }> {
		return http()
			.get(`/messagerie/loadThread/${threadId}/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	createThread(participants: number[], title: string, message: string): Promise<ThreadsBasic> {
		return http()
			.post(`/messagerie/create`, {
				participants: participants,
				title: title,
				message: message
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	answerThread(thread: string, content: string): Promise<{ messages: Message[] }> {
		return http()
			.post(`/messagerie/send/${thread}`, {
				content: content
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	pinMessage(thread: string, messageId: number, pin: boolean) {
		return http()
			.post(`/messagerie/pin/${thread}`, {
				messageId: messageId,
				pin: pin
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
