import { http } from '../utils/index.js';

export const NotificationService = {
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
