import { http } from '../utils/index.js';
import { Notification } from '@drpg/prisma';

export const NotificationService = {
	getNotifications(): Promise<Notification[]> {
		return http()
			.get('/notifications/list')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	readNotification(id: string): Promise<boolean> {
		return http()
			.patch(`/notifications/${id}/read`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	readAllNotification(): Promise<boolean> {
		return http()
			.patch(`/notifications/all/read`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
