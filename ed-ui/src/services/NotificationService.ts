import { http } from '../utils/index.js';
import { Notification } from '@drpg/prisma';

export const NotificationService = {
	getNotifications(): Promise<Notification[]> {
		return http()
			.get('/notifications/list')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
